import React, { useEffect, useMemo, useRef, useState } from 'react';
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

// --- Helper function to create a pre-rendered circled image with a border ---
// This function is now correctly defined at the top level.
const createCircledImage = (image, size, borderColor, borderWidth) => {
    const offscreenCanvas = document.createElement('canvas');
    const context = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;

    // Draw the circular clip
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, Math.PI * 2, true);
    context.clip();

    // Draw the image
    context.drawImage(image, 0, 0, size, size);

    // Draw the border
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, Math.PI * 2, true);
    context.strokeStyle = borderColor;
    context.lineWidth = borderWidth;
    context.stroke();

    return offscreenCanvas;
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
    const renderedImageCache = useRef(new Map()).current; // Cache for pre-rendered circled images
    const defaultAvatarRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState(0);
    const [hoveredUser, setHoveredUser] = useState(null);
    const [clickedUser, setClickedUser] = useState(null);


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
                    // Pre-render the image and store it in the rendered cache
                    const renderedAvatar = createCircledImage(img, 128, 'red', 4); // Use a larger size for quality
                    renderedImageCache.set(user.avatarUrl, renderedAvatar);
                    setLoadedImages(prev => prev + 1);
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${user.avatarUrl}`);
                    cacheEntry.loaded = 'error';
                    cacheEntry.image = defaultAvatarRef.current;
                    // Pre-render and cache the default avatar as well
                    const renderedDefault = createCircledImage(defaultAvatarRef.current, 128, 'red', 4);
                    renderedImageCache.set('default', renderedDefault);
                    setLoadedImages(prev => prev + 1);
                };
            }
        });
    }, [users, imageCache, renderedImageCache]);


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
                    e.stopPropagation(); // Prevent event from bubbling up to the map
                }
            }


            // Main drawing method, called by Google Maps API
            draw() {
                const projection = this.getProjection();
                if (!projection) return;

                const bounds = this.getMap().getBounds();
                if (!bounds) return;

                // Convert the map's geographical bounds to pixel coordinates
                const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
                const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

                // Calculate the dimensions and position for the canvas
                const width = ne.x - sw.x;
                const height = sw.y - ne.y;

                // Position the canvas to perfectly cover the visible map area
                this.canvas.style.left = `${sw.x}px`;
                this.canvas.style.top = `${ne.y}px`;

                // Ensure canvas internal resolution and CSS size match the viewport
                if (this.canvas.width !== width || this.canvas.height !== height) {
                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.canvas.style.width = `${width}px`;
                    this.canvas.style.height = `${height}px`;
                }

                // Clear the entire canvas for this frame
                this.ctx.clearRect(0, 0, width, height);

                // Get props for drawing
                const { users, quadtree, renderedImageCache, isVisible, hoveredUser } = this.props;
                if (!isVisible || !quadtree) return;

                const zoom = this.getMap().getZoom();
                const latSpan = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
                const lngSpan = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());

                // Calculate extended bounds for quadtree query (buffer zone)
                const extendedBounds = {
                    x0: bounds.getSouthWest().lng() - lngSpan * 0.25,
                    y0: bounds.getSouthWest().lat() - latSpan * 0.25,
                    x1: bounds.getNorthEast().lng() + lngSpan * 0.25,
                    y1: bounds.getNorthEast().lat() + latSpan * 0.25,
                };

                const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));

                // Use quadtree to efficiently find and draw visible markers
                quadtree.visit((node, x0, y0, x1, y1) => {
                    // Pruning check
                    if (x1 < extendedBounds.x0 || x0 > extendedBounds.x1 || y1 < extendedBounds.y0 || y0 > extendedBounds.y1) {
                        return true;
                    }

                    // If it's a leaf node
                    if (!node.length) {
                        let p = node;
                        do {
                            const user = p.data;
                            const point = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));

                            // We need to adjust the drawing coordinates to be relative to our canvas
                            const drawX = point.x - sw.x;
                            const drawY = point.y - ne.y;

                            if (point) {
                                const isHovered = hoveredUser && hoveredUser.seq === user.seq;

                                let imageToDraw = renderedImageCache.get(user.avatarUrl);

                                if (imageToDraw) {
                                    // --- Fast Path: Use the pre-rendered cache ---
                                    this.ctx.drawImage(imageToDraw, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                                } else {
                                    // --- Fallback Path: Draw manually if not cached yet ---
                                    const cacheEntry = imageCache.get(user.avatarUrl);
                                    let rawImage = defaultAvatarRef.current; // Start with default
                                    if (cacheEntry && cacheEntry.loaded) {
                                        rawImage = cacheEntry.image; // Use loaded image if available
                                    }

                                    // Draw the raw image manually with circle clipping
                                    this.ctx.save();
                                    this.ctx.beginPath();
                                    this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                                    this.ctx.clip();
                                    this.ctx.drawImage(rawImage, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                                    this.ctx.restore();
                                }

                                // Draw the border, with hover effect
                                this.ctx.beginPath();
                                this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                                this.ctx.strokeStyle = isHovered ? '#007BFF' : 'red';
                                this.ctx.lineWidth = isHovered ? 6 : 2;
                                this.ctx.stroke();
                            }
                        } while (p = p.next);
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
    }, [map]); // Re-run this effect only if the map instance changes


    // Effect to pass updated React props to the CustomUserOverlay instance
    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({
                users,
                quadtree,
                renderedImageCache,
                isVisible,
                defaultAvatarRef: defaultAvatarRef.current,
                hoveredUser,
                clickedUser,
                onSetHoveredUser: setHoveredUser,
                onSetClickedUser: setClickedUser,
            });
        }
    }, [users, quadtree, renderedImageCache, isVisible, hoveredUser, clickedUser]);


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