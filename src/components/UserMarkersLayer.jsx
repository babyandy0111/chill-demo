import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OverlayView, Marker } from '@react-google-maps/api';

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

const UserMarkersLayer = ({ map, users, isVisible }) => {
    const overlayViewRef = useRef(null);
    const canvasRef = useRef(null);
    const imageCache = useRef(new Map()).current;
    const defaultAvatarRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState(0);

    if (!defaultAvatarRef.current) {
        defaultAvatarRef.current = createDefaultAvatar();
    }

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
                    setLoadedImages(prev => prev + 1);
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${user.avatarUrl}`);
                    cacheEntry.loaded = 'error';
                    cacheEntry.image = defaultAvatarRef.current;
                    setLoadedImages(prev => prev + 1);
                };
            }
        });
    }, [users, imageCache]);

    const draw = useCallback(() => {
        if (!map || !canvasRef.current || !isVisible || !overlayViewRef.current) return;

        const context = canvasRef.current.getContext('2d');
        const projection = overlayViewRef.current.getProjection();
        const bounds = map.getBounds();
        const zoom = map.getZoom();

        if (!projection || !bounds) return;

        const mapDiv = map.getDiv();
        const width = mapDiv.clientWidth;
        const height = mapDiv.clientHeight;

        if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
        }

        context.clearRect(0, 0, width, height);

        const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
        context.strokeStyle = 'red'; // Change border color to red
        context.lineWidth = 2;

        for (const user of users) {
            if (user && bounds.contains({ lat: user.lat, lng: user.lng })) {
                const latLng = new google.maps.LatLng(user.lat, user.lng);
                const point = projection.fromLatLngToDivPixel(latLng);

                if (point) {
                    const x = point.x;
                    const y = point.y;

                    let imageToDraw = defaultAvatarRef.current;
                    const cacheEntry = user.avatarUrl ? imageCache.get(user.avatarUrl) : null;

                    if (cacheEntry && cacheEntry.loaded) {
                        imageToDraw = cacheEntry.image;
                    }

                    context.save();
                    context.beginPath();
                    context.arc(x, y, imageSize / 2, 0, Math.PI * 2, true);
                    context.clip();
                    context.drawImage(imageToDraw, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize);
                    context.restore();

                    context.beginPath();
                    context.arc(x, y, imageSize / 2, 0, Math.PI * 2, true);
                    context.stroke();
                }
            }
        }
    }, [map, users, isVisible, loadedImages]);

    const handleOverlayLoad = useCallback((overlayView) => {
        overlayViewRef.current = overlayView;
        const panes = overlayView.getPanes();
        if (panes && !canvasRef.current) {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            panes.overlayLayer.appendChild(canvas);
            canvasRef.current = canvas;
        }
    }, []);

    useEffect(() => {
        if (overlayViewRef.current) {
            draw();
        }
    }, [draw, loadedImages]);

    useEffect(() => {
        if (!map) return;
        const listener = map.addListener('bounds_changed', draw);
        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map, draw]);

    return (
        <>
            <OverlayView
                position={{ lat: 0, lng: 0 }} // Restore a valid position object
                mapPaneName={OverlayView.OVERLAY_LAYER}
                onLoad={handleOverlayLoad}
                onDraw={draw}
            >
                <></>
            </OverlayView>
            {isVisible && users.map((user, index) => (
                <Marker
                    key={user.seq || index}
                    position={{ lat: user.lat, lng: user.lng }}
                />
            ))}
        </>
    );
};

export default UserMarkersLayer;