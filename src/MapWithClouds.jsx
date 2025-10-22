import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, OverlayView } from "@react-google-maps/api";
import Particles from "react-particles";
import { particlesOptions } from "./cloud-particles-config.jsx";
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.natural", elementType: "labels", stylers: [{ visibility: "off" }] },
];

import cloudImage from "./assets/cloud.png";

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

const getGridKey = (lat, lng) => {
  const south = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
  const west = Math.floor(lng / GRID_SIZE) * GRID_SIZE;
  return `${south}_${west}`;
};

const MapWithClouds = forwardRef(({
  onClaimCell,
  claimedCells,
  setMapRef,
  onZoomChanged
}, ref) => {
  const [bounds, setBounds] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const mapInstanceRef = useRef(null);
  const particlesContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayViewRef = useRef(null); // Ref for the OverlayView

  const onParticlesLoaded = useCallback(container => {
    particlesContainerRef.current = container;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerParticles(lat, lng) {
      // ... (implementation remains the same)
    }
  }));

  const onOverlayLoad = useCallback((overlay) => {
    overlayViewRef.current = overlay;
  }, []);

  const handleMapLoad = useCallback((map) => {
    mapInstanceRef.current = map;
    setMapRef(map);
    setBounds(map.getBounds());
    setMapCenter(map.getCenter());
  }, [setMapRef]);

  const handleIdle = () => {
    if (mapInstanceRef.current) {
      onZoomChanged(mapInstanceRef.current.getZoom());
      setBounds(mapInstanceRef.current.getBounds());
      setMapCenter(mapInstanceRef.current.getCenter());
    }
  };

  const handleMouseMove = (e) => {
    const key = getGridKey(e.latLng.lat(), e.latLng.lng());
    setHoveredCell(key);
  };

  const handleMouseOut = () => {
    setHoveredCell(null);
  };

  const handleClick = (e) => {
    const south = Math.floor(e.latLng.lat() / GRID_SIZE) * GRID_SIZE;
    const west = Math.floor(e.latLng.lng() / GRID_SIZE) * GRID_SIZE;
    const cellBounds = { north: south + GRID_SIZE, south, east: west + GRID_SIZE, west };
    onClaimCell(cellBounds);
  };

  useEffect(() => {
    if (!canvasRef.current || !overlayViewRef.current || !bounds) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const projection = overlayViewRef.current.getProjection();
    if (!projection) return;

    // Fix: Synchronize canvas dimensions with the map div on every redraw
    const mapDiv = mapInstanceRef.current.getDiv();
    if (canvas.width !== mapDiv.clientWidth) canvas.width = mapDiv.clientWidth;
    if (canvas.height !== mapDiv.clientHeight) canvas.height = mapDiv.clientHeight;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startLat = Math.floor(sw.lat() / GRID_SIZE) * GRID_SIZE;
    const startLng = Math.floor(sw.lng() / GRID_SIZE) * GRID_SIZE;

    for (let lat = startLat; lat < ne.lat() + GRID_SIZE; lat += GRID_SIZE) {
      for (let lng = startLng; lng < ne.lng() + GRID_SIZE; lng += GRID_SIZE) {
        const key = `${lat}_${lng}`;
        const cellSW = new window.google.maps.LatLng(lat, lng);
        const cellNE = new window.google.maps.LatLng(lat + GRID_SIZE, lng + GRID_SIZE);
        const swPixel = projection.fromLatLngToDivPixel(cellSW);
        const nePixel = projection.fromLatLngToDivPixel(cellNE);

        ctx.beginPath();
        ctx.rect(swPixel.x, nePixel.y, nePixel.x - swPixel.x, swPixel.y - nePixel.y);

// In the useEffect hook...
        if (claimedCells[key]) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
          ctx.fill();
        } else if (key === hoveredCell) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
          ctx.fill();
        } else {
          // Make the default fill slightly more visible
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
        }
        
        // Make the grid lines bright and thick
        ctx.strokeStyle = '#FFFF00'; // Bright Yellow
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [bounds, hoveredCell, claimedCells]);

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
            styles: mapStyles, // Apply the clean map styles
          }}
          onLoad={handleMapLoad}
          onIdle={handleIdle}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
          onClick={handleClick}
        >
          {mapCenter && (
            <OverlayView
              position={mapCenter}
              mapPaneName={OverlayView.MAP_PANE}
              onLoad={onOverlayLoad}
              getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
            >
              <canvas
                ref={canvasRef}
                width={mapInstanceRef.current?.getDiv().clientWidth}
                height={mapInstanceRef.current?.getDiv().clientHeight}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              />
            </OverlayView>
          )}

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
