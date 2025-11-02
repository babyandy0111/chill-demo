import React, {useState, useCallback, useEffect, useRef, useMemo} from "react";
import {GoogleMap} from "@react-google-maps/api";
import CanvasOverlay from "./CanvasOverlay.jsx";
import CellInfoWindow from "../components/CellInfoWindow.jsx";
import CurrentUserLocationMarker from "../components/CurrentUserLocationMarker.jsx";
import { smoothAnimate } from "../map-animation.js";
import { fetchUserLocations } from '../data-loader.js';
import UserMarkersLayer from '../components/UserMarkersLayer.jsx';
import { useAppStore } from '../store.js'; // Import useAppStore

// Simple debounce utility
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

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
                           selectedCell,
                           userLocation,
                           onZoomOutLimit,
                           effects, // Receive effects as a prop
                       }) => {

    const [zoom, setZoom] = useState(15);
    const [mapInstance, setMapInstance] = useState(null);

    const wheelThrottleTimeout = useRef(null);
    const WHEEL_THROTTLE_MS = 150;
    const [isAnimating, setIsAnimating] = useState(false);
    const [userMarkers, setUserMarkers] = useState([]); // 新增 state 來儲存使用者標記數據
    const updateLastKnownLocation = useAppStore(state => state.updateLastKnownLocation); // Get action from Zustand

    const handleIdle = useCallback(() => {
        if (!mapInstance) return;

        const newZoom = mapInstance.getZoom();
        const minZoom = 5;

        if (newZoom <= minZoom) {
            onZoomOutLimit();
        }

        updateLastKnownLocation({ lat: mapInstance.getCenter().lat(), lng: mapInstance.getCenter().lng() });
        setZoom(newZoom);
    }, [mapInstance, onZoomOutLimit, updateLastKnownLocation]);

    const debouncedHandleIdle = useMemo(() => debounce(handleIdle, 200), [handleIdle]);

    // 在元件掛載時載入使用者數據
    useEffect(() => {
        fetchUserLocations().then(setUserMarkers);
    }, []);

    const handleMapLoad = useCallback((map) => {
        setMapInstance(map);
        setMapRef(map);
    }, [setMapRef]);

    useEffect(() => {
        // This effect runs only once on initial load to perform the fly-in animation.
        const runAnimation = async () => {
            if (mapInstance && center) {
                // We introduce a flag specifically for the *initial* animation.
                const initialAnimationCompleted = mapInstance.get('initialAnimationCompleted');
                if (!initialAnimationCompleted) {
                    await smoothAnimate(mapInstance, center, 2000, 16, setIsAnimating);
                    mapInstance.set('initialAnimationCompleted', true);
                    // After the very first animation, directly call the idle logic
                    // to ensure the initial position is saved correctly.
                    updateLastKnownLocation(center);
                }
            }
        };
        runAnimation();
        // We intentionally leave the dependency array sparse. This effect should
        // only be about the *initial* animation, not reacting to every center change.
    }, [mapInstance, center, setIsAnimating, updateLastKnownLocation]);



    const handleClick = useCallback((e) => {
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
    }, [onSelectCell]);

    const handleWheel = useCallback(async (e) => {
        e.preventDefault();
        if (wheelThrottleTimeout.current) return;

        wheelThrottleTimeout.current = setTimeout(async () => {
            wheelThrottleTimeout.current = null;
            if (!mapInstance) return;

            const currentZoom = mapInstance.getZoom();
            const targetZoom = e.deltaY < 0 ? currentZoom + 1 : currentZoom - 1;
            const clampedTargetZoom = Math.max(2, Math.min(20, targetZoom));

            if (clampedTargetZoom !== currentZoom) {
                await smoothAnimate(mapInstance, mapInstance.getCenter().toJSON(), 300, clampedTargetZoom, setIsAnimating);
            }
        }, WHEEL_THROTTLE_MS);
    }, [mapInstance, setIsAnimating]);

    const mapContainerRef = useRef(null); // Ref for the map container div

    useEffect(() => {
        const mapDiv = mapContainerRef.current;
        if (!mapDiv) return;

        // Manually add the wheel event listener with passive: false
        mapDiv.addEventListener('wheel', handleWheel, { passive: false });

        // Cleanup function to remove the event listener
        return () => {
            mapDiv.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    return (
        <div ref={mapContainerRef} className="view-container fade-in" style={mapRootStyle}>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={3}
                options={{
                    disableDefaultUI: true, gestureHandling: 'greedy', zoomControl: false,
                    tilt: 0, mapTypeId: 'roadmap',
                    styles: mapStyles,
                    minZoom: 2, maxZoom: 20,
                    scrollwheel: false,
                }}
                onLoad={handleMapLoad}
                onIdle={debouncedHandleIdle}

                onClick={handleClick}
            >
                <CanvasOverlay
                    map={mapInstance}
                    zoom={zoom}
                    claimedCells={claimedCells}
                    exploredCells={exploredCells}

                    isAnimating={isAnimating}
                    selectedCell={selectedCell}
                    effects={effects} // Pass effects to the canvas
                />
                {mapInstance && userMarkers.length > 0 && (
                    <UserMarkersLayer
                        map={mapInstance}
                        users={userMarkers}
                        isVisible={true}
                    />
                )}
                {selectedCell && <CellInfoWindow cellInfo={selectedCell} />}
                {userLocation && <CurrentUserLocationMarker position={userLocation} />}
            </GoogleMap>
        </div>
    );
};
export default React.memo(MapWithClouds);
