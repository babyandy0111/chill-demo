import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { OverlayView } from '@react-google-maps/api';

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
    const [hoveredUser, setHoveredUser] = useState(null);
    const [clickedUser, setClickedUser] = useState(null); // Reintroduce local state


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
                if (!projection || !this.props.users) return null;

                // Directly convert mouse pixel coordinates (relative to the map div) to LatLng
                const latLng = projection.fromDivPixelToLatLng(new window.google.maps.Point(x, y));
                if (!latLng) return null;

                // Find the nearest user in the quadtree within a small geographic radius
                const searchRadius = 0.01; // A small search radius in degrees
                
                // TODO: Replace quadtree.find with a more efficient method if needed, for now, we can iterate
                const visibleUsers = this.props.users.filter(user => {
                    const userPixel = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                    if (!userPixel) return false;
                    const distance = Math.sqrt(Math.pow(x - userPixel.x, 2) + Math.pow(y - userPixel.y, 2));
                    const zoom = this.getMap().getZoom();
                    const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
                    return distance <= imageSize / 2;
                });

                // Find the closest user among the visible ones
                let closestUser = null;
                let minDistance = Infinity;

                for (const user of visibleUsers) {
                    const userPixel = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                     if (!userPixel) continue;
                    const distance = Math.sqrt(Math.pow(x - userPixel.x, 2) + Math.pow(y - userPixel.y, 2));
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUser = user;
                    }
                }

                return closestUser;
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


            draw() {
                const projection = this.getProjection();
                if (!projection) {
                    return;
                }

                let bounds = this.getMap().getBounds();
                if (!bounds) {
                    return;
                }

                // --- Create an extended bounds for tolerance ---
                const zoom = this.getMap().getZoom();
                const extendFactor = 0.1; // Extend by 10% of the view
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                const lngDiff = (ne.lng() - sw.lng()) * extendFactor;
                const latDiff = (ne.lat() - sw.lat()) * extendFactor;

                const extendedBounds = new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(sw.lat() - latDiff, sw.lng() - lngDiff),
                    new window.google.maps.LatLng(ne.lat() + latDiff, ne.lng() + lngDiff)
                );
                // --- End of extended bounds creation ---


                const swPixel = projection.fromLatLngToDivPixel(bounds.getSouthWest());
                const nePixel = projection.fromLatLngToDivPixel(bounds.getNorthEast());

                const width = nePixel.x - swPixel.x;
                const height = swPixel.y - nePixel.y;

                this.canvas.style.left = `${swPixel.x}px`;
                this.canvas.style.top = `${nePixel.y}px`;

                if (this.canvas.width !== width || this.canvas.height !== height) {
                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.canvas.style.width = `${width}px`;
                    this.canvas.style.height = `${height}px`;
                }

                this.ctx.clearRect(0, 0, width, height);

                const { quadtree, isVisible } = this.props;
                if (!isVisible) return;

                const ZOOM_THRESHOLD = 12;

                if (zoom < ZOOM_THRESHOLD) {
                    this.drawClusters(projection, swPixel, nePixel, extendedBounds);
                } else {
                    this.drawIndividualMarkers(projection, swPixel, nePixel, extendedBounds);
                }
            }

            drawSingleMarker(user, projection, swPixel, nePixel) {
                const { hoveredUser } = this.props;
                const point = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                if (!point) return;

                const drawX = point.x - swPixel.x;
                const drawY = point.y - nePixel.y;

                const zoom = this.getMap().getZoom();
                const markerSize = Math.max(8, Math.min(40, (zoom - 12) * 4)); // Smaller size for simple markers
                const isHovered = hoveredUser && hoveredUser.seq === user.seq;

                // Draw a simple colored circle
                this.ctx.beginPath();
                this.ctx.arc(drawX, drawY, markerSize / 2, 0, Math.PI * 2, true);
                this.ctx.fillStyle = isHovered ? '#007BFF' : '#FF0000'; // Blue for hovered, Red for normal
                this.ctx.fill();

                // Draw border
                this.ctx.strokeStyle = isHovered ? '#0056b3' : '#cc0000';
                this.ctx.lineWidth = isHovered ? 3 : 1;
                this.ctx.stroke();
            }

                                    drawClusters(projection, swPixel, nePixel, extendedBounds) {
                                        const { users } = this.props;
                                        const zoom = this.getMap().getZoom();
                                        
                                        // Adjust the grid size based on zoom level for geographical clustering
                                        const gridSizeDegrees = 1.0 / Math.pow(2, zoom - 5);

                                        const clusters = new Map();
                                        
                                        // --- Brute-force filter instead of quadtree ---
                                        const visibleUsers = users.filter(user => extendedBounds.contains({ lat: user.lat, lng: user.lng }));
                                        
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
                        
                                                const drawX = point.x - swPixel.x;
                                                const drawY = point.y - nePixel.y;
                        
                                                const radius = 18 + Math.log2(count) * 2;
                                                this.ctx.beginPath();
                                                this.ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
                                                this.ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
                                                this.ctx.fill();
                                                this.ctx.strokeStyle = 'rgba(0, 123, 255, 1)';
                                                this.ctx.lineWidth = 2;
                                                this.ctx.stroke();
                        
                                                this.ctx.fillStyle = 'white';
                                                this.ctx.font = 'bold 18px sans-serif'; // Increased font size
                                                this.ctx.textAlign = 'center';
                                                this.ctx.textBaseline = 'middle';
                                                this.ctx.fillText(count, drawX, drawY);
                                            } else {
                                                this.drawSingleMarker(cluster.points[0], projection, swPixel, nePixel);
                                            }
                                        }
                                    }            drawIndividualMarkers(projection, swPixel, nePixel, extendedBounds) {
                const { users } = this.props;
                let drawnCount = 0;

                for (const user of users) {
                    if (extendedBounds.contains({ lat: user.lat, lng: user.lng })) {
                        this.drawSingleMarker(user, projection, swPixel, nePixel);
                        drawnCount++;
                    }
                }
                
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
    }, [map]); // Re-run this effect only if the map instance changes


    // Effect to pass updated React props to the CustomUserOverlay instance
    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({
                users,
                isVisible,
                hoveredUser,
                clickedUser,
                onSetHoveredUser: setHoveredUser,
                onSetClickedUser: setClickedUser,
            });
        }
    }, [users, isVisible, hoveredUser, clickedUser]);


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