import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import CanvasOverlay from "./CanvasOverlay.jsx";

const GRID_SIZE = 0.0005;

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 25.0330, lng: 121.5654 };
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

// This component is now much simpler. It only deals with the map and the grid overlay.
// All particle logic has been lifted up to App.jsx.
const MapWithClouds = ({ onClaimCell, claimedCells, setMapRef, onZoomChanged }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoom, setZoom] = useState(18);
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
    if (zoom < 17) {
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
    if (zoom < 17) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const iy = Math.floor(lat / GRID_SIZE);
    const ix = Math.floor(lng / GRID_SIZE);
    const key = `${iy}_${ix}`;
    
    const south = iy * GRID_SIZE;
    const west = ix * GRID_SIZE;
    const centerLat = south + GRID_SIZE / 2;
    const centerLng = west + GRID_SIZE / 2;

    // Pass all necessary info up to the App component.
    onClaimCell(key, centerLat, centerLng);
  };

  return (
    <div style={mapRootStyle}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={18}
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
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapWithClouds;