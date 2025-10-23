import React, { useState, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import CanvasOverlay from "./CanvasOverlay.jsx";
import CellInfoWindow from "./CellInfoWindow.jsx";
import CurrentUserLocationMarker from "./CurrentUserLocationMarker.jsx";

const GRID_SIZE = 0.0005;

const mapContainerStyle = { width: "100%", height: "100%" };
const mapRootStyle = {
  position: 'absolute', inset: '0px', width: '100%', height: '100%',
};
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.natural", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const MapWithClouds = ({ center, onSelectCell, claimedCells, setMapRef, onZoomChanged, selectedCell, onClaim, userLocation }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoom, setZoom] = useState(12);
  const [mapInstance, setMapInstance] = useState(null);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
    setMapRef(map);
    setZoom(map.getZoom());
  }, [setMapRef]);

  const handleIdle = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom();
      onZoomChanged(newZoom);
      setZoom(newZoom);
    }
  };

  const handleMouseMove = (e) => {
    if (zoom < 15) {
      if (hoveredCell) setHoveredCell(null);
      return;
    }
    const key = `${Math.floor(e.latLng.lat() / GRID_SIZE)}_${Math.floor(e.latLng.lng() / GRID_SIZE)}`;
    if (key !== hoveredCell) setHoveredCell(key);
  };

  const handleMouseOut = () => {
    setHoveredCell(null);
  };

  const handleClick = (e) => {
    if (zoom < 15) {
      onSelectCell(null, null);
      return;
    };

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const iy = Math.floor(lat / GRID_SIZE);
    const ix = Math.floor(lng / GRID_SIZE);
    const key = `${iy}_${ix}`;
    
    const south = iy * GRID_SIZE;
    const west = ix * GRID_SIZE;
    const centerLat = south + GRID_SIZE / 2;
    const centerLng = west + GRID_SIZE / 2;

    onSelectCell(key, { lat: centerLat, lng: centerLng });
  };

  return (
    <div style={mapRootStyle}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: true, gestureHandling: 'greedy', zoomControl: false,
          tilt: 0, mapTypeId: 'roadmap',
          styles: mapStyles,
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
          hoveredCell={hoveredCell}
        />

        {/* Both the InfoWindow and the LocationMarker are now correctly rendered here */}
        {selectedCell && (
          <CellInfoWindow
            cellInfo={selectedCell}
            onClaim={onClaim}
          />
        )}

        {userLocation && (
          <CurrentUserLocationMarker position={userLocation} />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapWithClouds;
