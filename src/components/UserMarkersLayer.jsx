import React, {useEffect, useMemo, useRef, useState} from 'react';
import { OverlayView } from '@react-google-maps/api';
import { quadtree as d3_quadtree } from 'd3-quadtree';

// --- Helper function to create a default placeholder avatar ---
const createDefaultAvatar = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 64; // A bit larger for better quality when scaled down
    canvas.width = size;
    canvas.height = size;

    // Draw a light grey circle
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw a simple person icon
    ctx.fillStyle = '#A0A0A0';
    // Head
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 + 15, 15, Math.PI, Math.PI * 2, false);
    ctx.fill();

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
};

// --- A simple popup component to show user info ---
const UserInfoPopup = ({ user, onClose }) => {
    // This function helps get the correct pane for the OverlayView.
    // 'floatPane' is generally a good choice for UI elements that should appear above markers.
    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: -(height + 40), // Position it above the marker
    });

    return (
        <OverlayView
            position={{ lat: user.lat, lng: user.lng }}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={getPixelPositionOffset}
        >
            <div onMouseDown={(e) => e.stopPropagation()} style={{
                background: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '150px',
            }}>
                <img src={user.avatarUrl} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <strong style={{ fontSize: '14px' }}>{user.name || 'Anonymous'}</strong>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '8px', right: '8px', background: '#F0F0F0',
                    border: 'none', fontSize: '14px', cursor: 'pointer', color: '#888',
                    zIndex: 10, // Ensure it's above other content in the popup
                    width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    &times;
                </button>
            </div>
        </OverlayView>
    );
};

const UserMarkersLayer = ({ map, users, isVisible }) => {
    const overlayRef = useRef(null); // Ref for our custom OverlayView instance
    const imageCache = useRef(new Map()).current; // Cache for raw Image objects
    const defaultAvatarRef = useRef(null);
    const [hoveredUser, setHoveredUser] = useState(null);
    const [clickedUser, setClickedUser] = useState(null); // Reintroduce local state

    // Ensure default avatar is created once
    if (!defaultAvatarRef.current) {
        defaultAvatarRef.current = createDefaultAvatar();
    }

    // Quadtree for efficient spatial querying
    const quadtree = useMemo(() => {
        if (!users || users.length === 0) {
            return null;
        }
        const newQuadtree = d3_quadtree()
            .x(d => d.lng)
            .y(d => d.lat)
            .addAll(users);
        return newQuadtree;
    }, [users]);

    // Effect to load and pre-render user avatars
    useEffect(() => {
        if (!users || users.length === 0) return;

        users.forEach(user => {
            if (user && user.avatarUrl && !imageCache.has(user.avatarUrl)) {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = user.avatarUrl;
                const cacheEntry = { image: img, loaded: false };
                imageCache.set(user.avatarUrl, cacheEntry);

                img.onload = () => {
                    cacheEntry.loaded = true;
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${user.avatarUrl}`);
                    cacheEntry.loaded = 'error';
                    cacheEntry.image = defaultAvatarRef.current;
                };
            }
        });
    }, [users, imageCache]);


    // Main effect to manage the custom Google Maps OverlayView
    useEffect(() => {
        if (!map) return;

        // Define our custom OverlayView class
        class CustomUserOverlay extends window.google.maps.OverlayView {
            constructor() {
                super();
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.style.position = 'absolute';
                this.canvas.style.left = '0px';
                this.canvas.style.top = '0px';
                this.canvas.style.pointerEvents = 'none'; // Let clicks pass through to the map by default
                this.canvas.style.zIndex = '5'; // Set a specific z-index
                this.props = {}; // To store React props
                this.mapDiv = null; // To hold a reference to the map's div

                // Bind event handlers
                this.handleMouseMove = this.handleMouseMove.bind(this);
                this.handleClick = this.handleClick.bind(this);
            }

            // Method to update props from React component
            setProps(props) {
                this.props = { ...this.props, ...props };
                this.draw(); // Trigger redraw when props change
            }

            // Called when the overlay is added to the map
            onAdd() {
                const panes = this.getPanes();
                panes.overlayLayer.appendChild(this.canvas);
                // Store the map div and add event listeners
                this.mapDiv = this.getMap().getDiv();
                this.mapDiv.addEventListener('mousemove', this.handleMouseMove);
                this.mapDiv.addEventListener('click', this.handleClick);
            }

            // Called when the overlay is removed from the map
            onRemove() {
                if (this.canvas.parentElement) {
                    this.canvas.parentElement.removeChild(this.canvas);
                }
                // Clean up event listeners from the stored div
                if (this.mapDiv) {
                    this.mapDiv.removeEventListener('mousemove', this.handleMouseMove);
                    this.mapDiv.removeEventListener('click', this.handleClick);
                    this.mapDiv = null;
                }
            }

            findUserAtPixel(x, y) {
                const projection = this.getProjection();
                if (!projection || !this.props.quadtree) return null;

                // We need the canvas's top-left corner in pixel coordinates to adjust the mouse position
                const bounds = this.getMap().getBounds();
                if (!bounds) return null;
                const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());

                // Adjust mouse coordinates to be absolute within the map div, not just the canvas
                const absoluteX = x + sw.x;
                const absoluteY = y + (projection.fromLatLngToDivPixel(bounds.getNorthEast())).y;


                // Convert absolute pixel coordinates to LatLng
                const latLng = projection.fromDivPixelToLatLng(new window.google.maps.Point(absoluteX, absoluteY));
                if (!latLng) return null;

                // Find the nearest user in the quadtree
                const searchRadius = 0.05; // Increased radius for better matching
                const foundUser = this.props.quadtree.find(latLng.lng(), latLng.lat(), searchRadius);

                if (foundUser) {
                    // Verify if the cursor is actually within the user's marker circle
                    const userPixel = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(foundUser.lat, foundUser.lng));
                    const zoom = this.getMap().getZoom();
                    const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
                    // Use absolute coordinates for distance check as well
                    const distance = Math.sqrt(Math.pow(absoluteX - userPixel.x, 2) + Math.pow(absoluteY - userPixel.y, 2));

                    if (distance <= imageSize / 2) {
                        return foundUser;
                    }
                }
                return null;
            }

            handleMouseMove(e) {
                const user = this.findUserAtPixel(e.offsetX, e.offsetY);
                this.props.onSetHoveredUser(user);

                // Change cursor style based on whether a user is hovered
                if (user) {
                    this.getMap().getDiv().style.cursor = 'pointer';
                } else {
                    this.getMap().getDiv().style.cursor = '';
                }
            }

            handleClick(e) {
                const user = this.findUserAtPixel(e.offsetX, e.offsetY);
                if (user) {
                    this.props.onSetClickedUser(user);
                }
            }


            // Main drawing method, called by Google Maps API
            draw() {
                const projection = this.getProjection();
                if (!projection) return;

                const bounds = this.getMap().getBounds();
                if (!bounds) return;

                const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
                const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

                const width = ne.x - sw.x;
                const height = sw.y - ne.y;

                this.canvas.style.left = `${sw.x}px`;
                this.canvas.style.top = `${ne.y}px`;

                if (this.canvas.width !== width || this.canvas.height !== height) {
                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.canvas.style.width = `${width}px`;
                    this.canvas.style.height = `${height}px`;
                }

                this.ctx.clearRect(0, 0, width, height);

                const { quadtree, isVisible } = this.props;
                if (!isVisible || !quadtree) return;

                const zoom = this.getMap().getZoom();
                const ZOOM_THRESHOLD = 12;

                if (zoom < ZOOM_THRESHOLD) {
                    this.drawClusters(projection, sw, ne, bounds);
                } else {
                    this.drawIndividualMarkers(projection, sw, ne, bounds);
                }
            }

            drawSingleMarker(user, projection, sw, ne) {
                const { hoveredUser, imageCache, defaultAvatarRef } = this.props;
                const point = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                if (!point) return;

                const drawX = point.x - sw.x;
                const drawY = point.y - ne.y;

                const zoom = this.getMap().getZoom();
                const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
                const isHovered = hoveredUser && hoveredUser.seq === user.seq;

                const cacheEntry = imageCache.get(user.avatarUrl);
                let imageToDraw = defaultAvatarRef.current; // Default to placeholder
                if (cacheEntry && cacheEntry.loaded === true) {
                    imageToDraw = cacheEntry.image;
                }

                if (!imageToDraw) return; // Don't draw if the default isn't even ready

                // --- Real-time circular drawing ---
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                this.ctx.clip();
                this.ctx.drawImage(imageToDraw, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                this.ctx.restore();
                // --- End of real-time circular drawing ---

                this.ctx.beginPath();
                this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                this.ctx.strokeStyle = isHovered ? '#007BFF' : 'red';
                this.ctx.lineWidth = isHovered ? 6 : 2;
                this.ctx.stroke();
            }

            drawClusters(projection, sw, ne, bounds) {
                const { quadtree } = this.props;
                const zoom = this.getMap().getZoom();
                
                // Adjust the grid size based on zoom level for geographical clustering
                const gridSizeDegrees = 0.5 / Math.pow(2, zoom - 5);

                const clusters = new Map();
                const visibleUsers = [];

                quadtree.visit((node, x0, y0, x1, y1) => {
                    const nodeBounds = new window.google.maps.LatLngBounds(
                        new window.google.maps.LatLng(y0, x0),
                        new window.google.maps.LatLng(y1, x1)
                    );
                    if (!bounds.intersects(nodeBounds)) {
                        return true; // Prune this branch
                    }

                    if (!node.length) { // It's a leaf node
                        let p = node;
                        do {
                            if (bounds.contains({lat: p.data.lat, lng: p.data.lng})) {
                               visibleUsers.push(p.data);
                            }
                        } while ((p = p.next));
                    }
                    return false; // Continue visiting children
                });

                for (const user of visibleUsers) {
                    const key = `${Math.floor(user.lat / gridSizeDegrees)}|${Math.floor(user.lng / gridSizeDegrees)}`;
                    if (!clusters.has(key)) {
                        clusters.set(key, { points: [], sumLat: 0, sumLng: 0 });
                    }
                    const cluster = clusters.get(key);
                    cluster.points.push(user);
                    cluster.sumLat += user.lat;
                    cluster.sumLng += user.lng;
                }

                for (const cluster of clusters.values()) {
                    const count = cluster.points.length;
                    if (count > 1) {
                        const centerLat = cluster.sumLat / count;
                        const centerLng = cluster.sumLng / count;
                        const point = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(centerLat, centerLng));
                        if (!point) continue;

                        const drawX = point.x - sw.x;
                        const drawY = point.y - ne.y;

                        const radius = 18 + Math.log2(count) * 2;
                        this.ctx.beginPath();
                        this.ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
                        this.ctx.fill();
                        this.ctx.strokeStyle = 'rgba(0, 123, 255, 1)';
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();

                        this.ctx.fillStyle = 'white';
                        this.ctx.font = 'bold 14px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(count, drawX, drawY);
                    } else {
                        this.drawSingleMarker(cluster.points[0], projection, sw, ne);
                    }
                }
            }

            drawIndividualMarkers(projection, sw, ne, bounds) {
                const { quadtree } = this.props;

                quadtree.visit((node, x0, y0, x1, y1) => {
                    const nodeBounds = new window.google.maps.LatLngBounds(
                        new window.google.maps.LatLng(y0, x0),
                        new window.google.maps.LatLng(y1, x1)
                    );
                    if (!bounds.intersects(nodeBounds)) {
                        return true; // Prune this branch
                    }

                    if (!node.length) { // It's a leaf node
                        let p = node;
                        do {
                           if (bounds.contains({lat: p.data.lat, lng: p.data.lng})) {
                               this.drawSingleMarker(p.data, projection, sw, ne);
                           }
                        } while ((p = p.next));
                    }
                    return false; // Continue visiting children
                });
            }
        }

        // Instantiate and set our custom overlay on the map
        const overlay = new CustomUserOverlay();
        overlay.setMap(map);
        overlayRef.current = overlay;

        // Cleanup function for when the component unmounts
        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
        };
    }, [map, imageCache]); // Re-run this effect only if the map instance changes


    // Effect to pass updated React props to the CustomUserOverlay instance
    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({
                users,
                quadtree,
                imageCache,
                isVisible,
                defaultAvatarRef: defaultAvatarRef.current,
                hoveredUser,
                clickedUser,
                onSetHoveredUser: setHoveredUser,
                onSetClickedUser: setClickedUser,
            });
        }
    }, [users, quadtree, isVisible, hoveredUser, clickedUser, imageCache]);


    return (
        <>
            {/* The custom overlay is managed by the useEffect hook and native Google Maps API */}
            {clickedUser && (
                <UserInfoPopup user={clickedUser} onClose={() => setClickedUser(null)} />
            )}
        </>
    );
};


export default UserMarkersLayer;