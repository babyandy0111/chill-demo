import React, { useEffect, useRef, useState } from 'react';
import { OverlayView } from '@react-google-maps/api';

// --- Helper function to create a default placeholder avatar ---
const createDefaultAvatar = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 + 15, 15, Math.PI, Math.PI * 2, false);
    ctx.fill();
    return canvas;
};

// --- A simple popup component to show user info ---
const UserInfoPopup = ({ user, onClose }) => {
    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: -(height + 40),
    });

    return (
        <OverlayView
            position={{ lat: user.lat, lng: user.lng }}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={getPixelPositionOffset}
        >
            <div onMouseDown={(e) => e.stopPropagation()} style={{
                background: 'white', padding: '10px 15px', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: '8px', width: '150px',
            }}>
                <img src={user.avatarUrl || '/chill-demo/vite.svg'} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <strong style={{ fontSize: '14px' }}>{user.name || 'Anonymous'}</strong>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '8px', right: '8px', background: '#F0F0F0',
                    border: 'none', fontSize: '14px', cursor: 'pointer', color: '#888',
                    width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    &times;
                </button>
            </div>
        </OverlayView>
    );
};

const UserMarkersLayer = ({ map, users, isVisible }) => {
    const overlayRef = useRef(null);
    const [clickedUser, setClickedUser] = useState(null);

    useEffect(() => {
        if (!map) return;

        class CustomUserOverlay extends window.google.maps.OverlayView {
            constructor() {
                super();
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.style.position = 'absolute';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '5';

                this.props = {};
                this.mapDiv = null;
                this.hoveredUser = null;
                this.imageCache = new Map();
                this.defaultAvatar = createDefaultAvatar();

                this.handleMouseMove = this.handleMouseMove.bind(this);
                this.handleClick = this.handleClick.bind(this);
            }

            setProps(props) {
                this.props = { ...this.props, ...props };
                this.draw();
            }

            onAdd() {
                const panes = this.getPanes();
                panes.overlayLayer.appendChild(this.canvas);
                this.mapDiv = this.getMap().getDiv();
                this.mapDiv.addEventListener('mousemove', this.handleMouseMove);
                this.mapDiv.addEventListener('click', this.handleClick);
            }

            onRemove() {
                if (this.canvas.parentElement) {
                    this.canvas.parentElement.removeChild(this.canvas);
                }
                if (this.mapDiv) {
                    this.mapDiv.removeEventListener('mousemove', this.handleMouseMove);
                    this.mapDiv.removeEventListener('click', this.handleClick);
                    this.mapDiv = null;
                }
            }

            findUserAtPixel(x, y) {
                const projection = this.getProjection();
                if (!projection || !this.props.users) return null;

                const visibleUsers = this.props.users.filter(user => {
                    const userPixel = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                    if (!userPixel) return false;
                    const distance = Math.sqrt(Math.pow(x - userPixel.x, 2) + Math.pow(y - userPixel.y, 2));
                    const zoom = this.getMap().getZoom();
                    const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
                    return distance <= imageSize / 2;
                });

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
                if (user !== this.hoveredUser) {
                    this.hoveredUser = user;
                    this.draw(); // Manually trigger redraw for hover effect
                }
                this.getMap().getDiv().style.cursor = user ? 'pointer' : '';
            }

            handleClick(e) {
                const user = this.findUserAtPixel(e.offsetX, e.offsetY);
                if (user) {
                    this.props.onSetClickedUser(user);
                }
            }

            draw() {
                const projection = this.getProjection();
                if (!projection) return;
                const bounds = this.getMap().getBounds();
                if (!bounds) return;

                const zoom = this.getMap().getZoom();
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                const swPixel = projection.fromLatLngToDivPixel(sw);
                const nePixel = projection.fromLatLngToDivPixel(ne);
                const width = nePixel.x - swPixel.x;
                const height = swPixel.y - nePixel.y;

                if (this.canvas.width !== width || this.canvas.height !== height) {
                    this.canvas.width = width;
                    this.canvas.height = height;
                }
                this.canvas.style.left = `${swPixel.x}px`;
                this.canvas.style.top = `${nePixel.y}px`;

                this.ctx.clearRect(0, 0, width, height);
                if (!this.props.isVisible) return;

                const ZOOM_THRESHOLD = 12;
                if (zoom < ZOOM_THRESHOLD) {
                    this.drawClusters(projection, swPixel, nePixel, bounds);
                } else {
                    this.drawIndividualMarkers(projection, swPixel, nePixel, bounds);
                }
            }

            drawSingleMarker(user, projection, swPixel, nePixel) {
                const point = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(user.lat, user.lng));
                if (!point) return;

                const drawX = point.x - swPixel.x;
                const drawY = point.y - nePixel.y;
                const zoom = this.getMap().getZoom();
                const imageSize = Math.max(16, Math.min(80, (zoom - 12) * 8));
                const isHovered = this.hoveredUser && this.hoveredUser.seq === user.seq;
                const imageUrl = user.avatarUrl || '/chill-demo/vite.svg';

                const cacheEntry = this.imageCache.get(imageUrl);

                if (cacheEntry && cacheEntry.loaded) {
                    this.ctx.drawImage(cacheEntry.image, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                } else if (cacheEntry && !cacheEntry.loaded) {
                    this.ctx.drawImage(this.defaultAvatar, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                } else {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    this.imageCache.set(imageUrl, { image: img, loaded: false });

                    img.onload = () => {
                        this.imageCache.get(imageUrl).loaded = true;
                        this.draw(); // CRITICAL: Redraw when image is ready
                    };
                    img.onerror = () => {
                        this.imageCache.get(imageUrl).image = this.defaultAvatar;
                        this.imageCache.get(imageUrl).loaded = true;
                        this.draw(); // Also redraw on error to show default avatar
                    };
                    img.src = imageUrl;
                    this.ctx.drawImage(this.defaultAvatar, drawX - imageSize / 2, drawY - imageSize / 2, imageSize, imageSize);
                }

                this.ctx.beginPath();
                this.ctx.arc(drawX, drawY, imageSize / 2, 0, Math.PI * 2, true);
                this.ctx.strokeStyle = isHovered ? '#007BFF' : 'red';
                this.ctx.lineWidth = isHovered ? 6 : 2;
                this.ctx.stroke();
            }

            drawClusters(projection, swPixel, nePixel, extendedBounds) {
                const { users } = this.props;
                const zoom = this.getMap().getZoom();
                const gridSizeDegrees = 1.0 / Math.pow(2, zoom - 5);
                const clusters = new Map();
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
                        this.ctx.font = 'bold 18px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(count, drawX, drawY);
                    } else {
                        this.drawSingleMarker(cluster.points[0], projection, swPixel, nePixel);
                    }
                }
            }

            drawIndividualMarkers(projection, swPixel, nePixel, extendedBounds) {
                const { users } = this.props;
                for (const user of users) {
                    if (extendedBounds.contains({ lat: user.lat, lng: user.lng })) {
                        this.drawSingleMarker(user, projection, swPixel, nePixel);
                    }
                }
            }
        }

        const overlay = new CustomUserOverlay();
        overlay.setMap(map);
        overlayRef.current = overlay;

        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
        };
    }, [map]);

    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({
                users,
                isVisible,
                onSetClickedUser: setClickedUser,
            });
        }
    }, [users, isVisible]);

    return (
        <>
            {clickedUser && (
                <UserInfoPopup user={clickedUser} onClose={() => setClickedUser(null)} />
            )}
        </>
    );
};

export default UserMarkersLayer;
