import React, { useState, useCallback, useEffect } from "react";
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
  const [zoom, setZoom] = useState(3); // Start with a zoomed-out view
  const [mapInstance, setMapInstance] = useState(null);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
    setMapRef(map);
  }, [setMapRef]);

  // Effect for the cinematic "fly-to" animation
  useEffect(() => {
    if (mapInstance) {
      // Start the animation shortly after the component fades in
      const flyToTimeout = setTimeout(() => {
        mapInstance.panTo(center);

        // Gradually zoom in after panning starts
        let currentZoom = mapInstance.getZoom();
        const targetZoom = 15;
        const zoomInterval = setInterval(() => {
          if (currentZoom < targetZoom) {
            currentZoom++;
            mapInstance.setZoom(currentZoom);
          } else {
            clearInterval(zoomInterval);
            // Manually trigger idle once animation is complete to update state
            handleIdle();
          }
        }, 150); // Adjust interval for zoom speed
      }, 500); // 500ms delay after map load

      return () => {
        clearTimeout(flyToTimeout);
      };
    }
  }, [mapInstance, center]);

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
    <div className="view-container fade-in" style={mapRootStyle}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={3} // Initial zoom is low
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
