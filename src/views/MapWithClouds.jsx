import React, {useState, useCallback, useEffect, useRef} from "react";
import {GoogleMap} from "@react-google-maps/api";
import CanvasOverlay from "./CanvasOverlay.jsx";
import CellInfoWindow from "../components/CellInfoWindow.jsx";
import CurrentUserLocationMarker from "../components/CurrentUserLocationMarker.jsx";
import { smoothAnimate } from "../map-animation.js";
import { fetchUserLocations } from '../data-loader.js';
import UserMarkersLayer from '../components/UserMarkersLayer.jsx';

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
                           effects, // Receive effects as a prop
                       }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [zoom, setZoom] = useState(15);
    const [mapInstance, setMapInstance] = useState(null);
    const throttleTimeout = useRef(null);
    const hasAnimatedRef = useRef(false);
    const wheelThrottleTimeout = useRef(null);
    const WHEEL_THROTTLE_MS = 150;
    const [isAnimating, setIsAnimating] = useState(false);
    const [userMarkers, setUserMarkers] = useState([]); // 新增 state 來儲存使用者標記數據

    // 在元件掛載時載入使用者數據
    useEffect(() => {
        fetchUserLocations().then(setUserMarkers);
    }, []);

    const handleMapLoad = useCallback((map) => {
        setMapInstance(map);
        setMapRef(map);
    }, [setMapRef]);

    const handleIdle = useCallback(() => {
        if (!mapInstance || !hasAnimatedRef.current) return;

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
                await smoothAnimate(mapInstance, center, 2000, 15, setIsAnimating);
                hasAnimatedRef.current = true;
                handleIdle();
            }
        };
        runAnimation();
    }, [mapInstance, center, handleIdle, setIsAnimating]);

    const handleMouseMove = useCallback((e) => {
        if (throttleTimeout.current) return;
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

        // Effect creation is no longer handled here
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
        e.preventDefault();
        if (wheelThrottleTimeout.current) return;

        wheelThrottleTimeout.current = setTimeout(async () => {
            wheelThrottleTimeout.current = null;
            if (!mapInstance) return;

            const currentZoom = mapInstance.getZoom();
            const targetZoom = e.deltaY < 0 ? currentZoom + 1 : currentZoom - 1;
            const clampedTargetZoom = Math.max(5, Math.min(20, targetZoom));

            if (clampedTargetZoom !== currentZoom) {
                await smoothAnimate(mapInstance, mapInstance.getCenter().toJSON(), 300, clampedTargetZoom, setIsAnimating);
            }
        }, WHEEL_THROTTLE_MS);
    }, [mapInstance, setIsAnimating]);

    return (
        <div className="view-container fade-in" style={mapRootStyle} onWheel={handleWheel}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={3}
                options={{
                    disableDefaultUI: true, gestureHandling: 'greedy', zoomControl: false,
                    tilt: 0, mapTypeId: 'roadmap',
                    styles: mapStyles,
                    minZoom: 5, maxZoom: 20,
                    scrollwheel: false,
                }}
                onLoad={handleMapLoad}
                onIdle={handleIdle}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onClick={handleClick}
            >
                {mapInstance && userMarkers.length > 0 && (
                    <UserMarkersLayer
                        map={mapInstance}
                        users={userMarkers}
                        isVisible={true}
                    />
                )}
                <CanvasOverlay
                    map={mapInstance}
                    zoom={zoom}
                    claimedCells={claimedCells}
                    exploredCells={exploredCells}
                    hoveredCell={hoveredCell}
                    isAnimating={isAnimating}
                    selectedCell={selectedCell}
                    effects={effects} // Pass effects to the canvas
                />
                {selectedCell && <CellInfoWindow cellInfo={selectedCell} />}
                {userLocation && <CurrentUserLocationMarker position={userLocation} />}
            </GoogleMap>
        </div>
    );
};
export default React.memo(MapWithClouds);
