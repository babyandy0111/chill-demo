import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Particles from "react-particles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import cloudImage from "./assets/cloud.png";
import CanvasOverlay from "./CanvasOverlay.jsx";

const GRID_SIZE = 0.0005;

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 25.0330, lng: 121.5654 };
const particlesStyle = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  zIndex: 5, pointerEvents: "none",
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

const getGridKey = (lat, lng) => {
  const south = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
  const west = Math.floor(lng / GRID_SIZE) * GRID_SIZE;
  return `${south}_${west}`;
};

const MapWithClouds = forwardRef(({ onClaimCell, claimedCells, setMapRef, onZoomChanged }, ref) => {
  const [bounds, setBounds] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoom, setZoom] = useState(18);
  const mapInstanceRef = useRef(null);
  const particlesContainerRef = useRef(null);

  const onParticlesLoaded = useCallback(container => {
    particlesContainerRef.current = container;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerParticles(lat, lng) {
      if (particlesContainerRef.current && mapInstanceRef.current) {
        const projection = mapInstanceRef.current.getProjection();
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
    mapInstanceRef.current = map;
    setMapRef(map);
    setZoom(map.getZoom());
    setBounds(map.getBounds());
  }, [setMapRef]);

  const handleIdle = () => {
    if (mapInstanceRef.current) {
      const newZoom = mapInstanceRef.current.getZoom();
      onZoomChanged(newZoom);
      setZoom(newZoom);
      setBounds(mapInstanceRef.current.getBounds());
    }
  };

  const handleMouseMove = (e) => {
    if (zoom < 17) {
      if (hoveredCell) setHoveredCell(null);
      return;
    }
    const key = getGridKey(e.latLng.lat(), e.latLng.lng());
    if (key !== hoveredCell) setHoveredCell(key);
  };

  const handleMouseOut = () => {
    setHoveredCell(null);
  };

  const handleClick = (e) => {
    if (zoom < 17) return;
    const south = Math.floor(e.latLng.lat() / GRID_SIZE) * GRID_SIZE;
    const west = Math.floor(e.latLng.lng() / GRID_SIZE) * GRID_SIZE;
    const cellBounds = { north: south + GRID_SIZE, south, east: west + GRID_SIZE, west };
    onClaimCell(cellBounds);
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
          <CanvasOverlay
            bounds={bounds}
            zoom={zoom}
            claimedCells={claimedCells}
            hoveredCell={hoveredCell}
          />

          {Object.keys(claimedCells).map((key) => {
            const [lat, lng] = key.split('_').map(Number);
            const cellCenter = { lat: lat + GRID_SIZE / 2, lng: lng + GRID_SIZE / 2 };
            return (
              <Marker
                key={`marker-${key}`}
                position={cellCenter}
                icon={{
                  url: cloudImage,
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20),
                }}
                clickable={false}
              />
            );
          })}
        </GoogleMap>
      </LoadScript>
    </div>
  );
});

export default MapWithClouds;