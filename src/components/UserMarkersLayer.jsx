import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marker } from '@react-google-maps/api';
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


const UserMarkersLayer = ({ map, users, isVisible }) => {
    const overlayRef = useRef(null); // Ref for our custom OverlayView instance
    const imageCache = useRef(new Map()).current; // Cache for raw Image objects
    const renderedImageCache = useRef(new Map()).current; // Cache for pre-rendered circled images
    const defaultAvatarRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState(0);

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
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '5'; // Set a specific z-index
                this.props = {}; // To store React props
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
            }

            // Called when the overlay is removed from the map
            onRemove() {
                if (this.canvas.parentElement) {
                    this.canvas.parentElement.removeChild(this.canvas);
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
                const { users, quadtree, renderedImageCache, isVisible } = this.props;
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

                                    // Draw the border
                                    this.ctx.beginPath();
                                    this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                                    this.ctx.strokeStyle = 'red';
                                    this.ctx.lineWidth = 2;
                                    this.ctx.stroke();
                                }
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
            overlayRef.current.setProps({ users, quadtree, renderedImageCache, isVisible, defaultAvatarRef: defaultAvatarRef.current });
        }
    }, [users, quadtree, renderedImageCache, isVisible, defaultAvatarRef.current]);


    return (
        <>
            {/* The custom overlay is managed by the useEffect hook and native Google Maps API,
                so it doesn't render a React component here. */}
            {/*{isVisible && users.map((user, index) => (*/}
            {/*    <Marker*/}
            {/*        key={user.seq || index}*/}
            {/*        position={{ lat: user.lat, lng: user.lng }}*/}
            {/*    />*/}
            {/*))}*/}
        </>
    );
};

export default UserMarkersLayer;