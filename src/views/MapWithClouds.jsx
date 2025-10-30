import React, {useState, useCallback, useEffect, useRef} from "react";
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
                           onZoomOutLimit, // New prop to handle zoom out limit
                       }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [zoom, setZoom] = useState(15);
    const [mapInstance, setMapInstance] = useState(null);
    const throttleTimeout = useRef(null);
    const hasAnimatedRef = useRef(false);

    const handleMapLoad = useCallback((map) => {
        setMapInstance(map);
        setMapRef(map);
    }, [setMapRef]);

    const handleIdle = useCallback(() => {
        // Do not run any logic until the initial animation has completed.
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
                await smoothAnimate(mapInstance, center, 2000, 15);
                handleIdle();
            }
        };
        runAnimation();
    }, [mapInstance, center, handleIdle]);

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

    return (
        <div className="view-container fade-in" style={mapRootStyle}>
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
