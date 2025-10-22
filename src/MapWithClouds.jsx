import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import Particles from "react-particles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import CanvasOverlay from "./CanvasOverlay.jsx";

const GRID_SIZE = 0.0005;

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 25.0330, lng: 121.5654 };
const particlesStyle = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  zIndex: 200, pointerEvents: "none",
};
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

const MapWithClouds = forwardRef(({ onClaimCell, claimedCells, setMapRef, onZoomChanged }, ref) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoom, setZoom] = useState(18);
  const [mapInstance, setMapInstance] = useState(null); // State to hold the map instance
  const particlesContainerRef = useRef(null);

  const onParticlesLoaded = useCallback(container => {
    particlesContainerRef.current = container;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerParticles(lat, lng) {
      if (particlesContainerRef.current && mapInstance) {
        const projection = mapInstance.getProjection();
        if (!projection) return;
        const domPoint = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(lat, lng));
        if (domPoint) {
          particlesContainerRef.current.addEmitter({
            position: { x: domPoint.x, y: domPoint.y },
          });
        }
      }
    }
  }));

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map); // Save the map instance to state
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
    // Use integer-based key to avoid float precision issues.
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

    // Use integer-based key to avoid float precision issues.
    const key = `${Math.floor(lat / GRID_SIZE)}_${Math.floor(lng / GRID_SIZE)}`;
    
    // Calculate center for the particle effect.
    const south = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
    const west = Math.floor(lng / GRID_SIZE) * GRID_SIZE;
    const centerLat = south + GRID_SIZE / 2;
    const centerLng = west + GRID_SIZE / 2;

    onClaimCell(key, centerLat, centerLng);
  };

  return (
    <div style={mapRootStyle}>
      <Particles id="tsparticles" options={particlesOptions} onLoaded={onParticlesLoaded} style={particlesStyle} />
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
          {/* The new CanvasOverlay receives the map instance and handles all drawing */}
          <CanvasOverlay
            map={mapInstance}
            zoom={zoom}
            claimedCells={claimedCells}
            hoveredCell={hoveredCell}
          />

          {/* 
            We no longer need to render Markers here. 
            The CanvasOverlay is now responsible for drawing the claimed cells.
            This is much more performant.
          */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
});

export default MapWithClouds;
