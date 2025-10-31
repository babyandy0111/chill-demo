import React, {useState, useCallback, useEffect, useRef} from "react";
import { createPortal } from 'react-dom';
import {GoogleMap} from "@react-google-maps/api";
import CanvasOverlay from "./CanvasOverlay.jsx";
import CellInfoWindow from "../components/CellInfoWindow.jsx";
import CurrentUserLocationMarker from "../components/CurrentUserLocationMarker.jsx";
import { smoothAnimate } from "../map-animation.js"; // Import the smooth animation function

const GRID_SIZE = 0.0005;
const mapContainerStyle = {width: "100%", height: "100%"};
const mapRootStyle = {
    position: 'absolute', inset: '0px', width: '100%', height: '100%',
};
const mapStyles = [
    {featureType: "poi", elementType: "labels", stylers: [{visibility: "off"}]},
    {featureType: "transit", elementType: "labels", stylers: [{visibility: "off"}]},
    {featureType: "road", elementType: "labels.icon", stylers: [{visibility: "off"}]},
    {featureType: "administrative", stylers: [{visibility: "off"}]},
    {featureType: "landscape.natural", elementType: "labels", stylers: [{visibility: "off"}]},
];

const MapWithClouds = ({
                           center,
                           onSelectCell,
                           claimedCells,
                           exploredCells,
                           setMapRef,
                           onZoomChanged,
                           onCenterChanged,
                           selectedCell,
                           userLocation,
                           onZoomOutLimit,
                       }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [zoom, setZoom] = useState(15);
    const [mapInstance, setMapInstance] = useState(null);
    const throttleTimeout = useRef(null);
    const hasAnimatedRef = useRef(false);
    const wheelThrottleTimeout = useRef(null);
    const WHEEL_THROTTLE_MS = 150; // Throttle wheel events
    const [isAnimating, setIsAnimating] = useState(false); // New state for animation status
    const [effects, setEffects] = useState([]);


    const handleMapLoad = useCallback((map) => {
        setMapInstance(map);
        setMapRef(map);
    }, [setMapRef]);

    const handleIdle = useCallback(() => {
        if (!hasAnimatedRef.current || !mapInstance) return;

        const newZoom = mapInstance.getZoom();
        const newCenter = mapInstance.getCenter();
        const minZoom = 5;

        if (newZoom <= minZoom) {
            onZoomOutLimit();
        }

        onZoomChanged(newZoom);
        onCenterChanged({ lat: newCenter.lat(), lng: newCenter.lng() });
        setZoom(newZoom);
    }, [mapInstance, onZoomChanged, onCenterChanged, onZoomOutLimit]);

    useEffect(() => {
        const runAnimation = async () => {
            if (mapInstance && center && !hasAnimatedRef.current) {
                hasAnimatedRef.current = true;
                await smoothAnimate(mapInstance, center, 2000, 15, setIsAnimating); // Pass setIsAnimating
                handleIdle();
            }
        };
        runAnimation();
    }, [mapInstance, center, handleIdle, setIsAnimating]);

    const handleMouseMove = useCallback((e) => {
        if (throttleTimeout.current) {
            return;
        }
        throttleTimeout.current = setTimeout(() => {
            throttleTimeout.current = null;
            if (zoom < 15) {
                if (hoveredCell) setHoveredCell(null);
                return;
            }
            const key = `${Math.floor(e.latLng.lat() / GRID_SIZE)}_${Math.floor(e.latLng.lng() / GRID_SIZE)}`;
            if (key !== hoveredCell) {
                setHoveredCell(key);
            }
        }, 50);
    }, [zoom, hoveredCell, setHoveredCell]);

    const handleMouseOut = useCallback(() => {
        setHoveredCell(null);
    }, [setHoveredCell]);

    const handleClick = useCallback((e) => {
        if (zoom < 15) {
            onSelectCell(null, null);
            return;
        }

        // --- React-style effect creation ---
        const newEffect = {
            id: Date.now() + Math.random(), // Unique ID for the effect
            size: Math.random() * 100 + 80,
            x: e.domEvent.clientX,
            y: e.domEvent.clientY,
        };

        setEffects(currentEffects => [...currentEffects, newEffect]);
        setTimeout(() => {
            setEffects(currentEffects => currentEffects.filter(effect => effect.id !== newEffect.id));
        }, 5000); // Corresponds to animation duration

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const iy = Math.floor(lat / GRID_SIZE);
        const ix = Math.floor(lng / GRID_SIZE);
        const key = `${iy}_${ix}`;
        const south = iy * GRID_SIZE;
        const west = ix * GRID_SIZE;
        const centerLat = south + GRID_SIZE / 2;
        const centerLng = west + GRID_SIZE / 2;
        onSelectCell(key, {lat: centerLat, lng: centerLng});
    }, [zoom, onSelectCell]);

    const handleWheel = useCallback(async (e) => {
        e.preventDefault(); // Prevent default browser scroll behavior
        if (wheelThrottleTimeout.current) return;

        wheelThrottleTimeout.current = setTimeout(async () => {
            wheelThrottleTimeout.current = null;
            if (!mapInstance) return;

            const currentZoom = mapInstance.getZoom();
            const targetZoom = e.deltaY < 0 ? currentZoom + 1 : currentZoom - 1;

            // Clamp targetZoom to min/max allowed by GoogleMap options
            const clampedTargetZoom = Math.max(5, Math.min(20, targetZoom));

            if (clampedTargetZoom !== currentZoom) {
                await smoothAnimate(mapInstance, mapInstance.getCenter().toJSON(), 300, clampedTargetZoom, setIsAnimating); // Pass setIsAnimating
            }
        }, WHEEL_THROTTLE_MS);
    }, [mapInstance, setIsAnimating]);

    return (
        <div className="view-container fade-in" style={mapRootStyle} onWheel={handleWheel}>
            {createPortal(
                effects.map(effect => (
                    <div
                        key={effect.id}
                        className="effect-3-particle"
                        style={{
                            width: `${effect.size}px`,
                            height: `${effect.size}px`,
                            left: `${effect.x - effect.size / 2}px`,
                            top: `${effect.y - effect.size / 2}px`,
                        }}
                    />
                )),
                document.body
            )}
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={3} // Start zoomed out
                options={{
                    disableDefaultUI: true, gestureHandling: 'greedy', zoomControl: false,
                    tilt: 0, mapTypeId: 'roadmap',
                    styles: mapStyles,
                    minZoom: 5, // Set the minimum zoom level
                    maxZoom: 20, // Set the maximum zoom level
                    scrollwheel: false, // Disable default scrollwheel zoom
                }}
                onLoad={handleMapLoad}
                onIdle={handleIdle}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onClick={handleClick}
            >
                <CanvasOverlay
                    map={mapInstance}
                    zoom={zoom}
                    claimedCells={claimedCells}
                    exploredCells={exploredCells}
                    hoveredCell={hoveredCell}
                    isAnimating={isAnimating}
                    selectedCell={selectedCell} // Pass selectedCell down
                />
                {selectedCell && (
                    <CellInfoWindow
                        cellInfo={selectedCell}
                    />
                )}
                {userLocation && (
                    <CurrentUserLocationMarker position={userLocation}/>
                )}
            </GoogleMap>
        </div>
    );
};
export default React.memo(MapWithClouds);
