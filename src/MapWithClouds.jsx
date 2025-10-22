import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, Marker, Rectangle } from "@react-google-maps/api";
import Particles from "react-particles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import cloudImage from "./assets/cloud.png";

const GRID_SIZE = 0.0005;

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 25.0330, lng: 121.5654 };
const particlesStyle = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  zIndex: 5, // Increased zIndex to ensure particles are visible above the grid
  pointerEvents: "none",
};
const mapRootStyle = {
  position: 'absolute', inset: '0px', width: '100%', height: '100%',
};

const options = {
  default: {
    strokeColor: '#FFFFFF', strokeOpacity: 0.3, strokeWeight: 1,
    fillColor: '#FFFFFF', fillOpacity: 0.1, clickable: true, zIndex: 1,
  },
  hover: {
    strokeColor: '#FFFF00', strokeOpacity: 1, strokeWeight: 2,
    fillColor: '#FFFF00', fillOpacity: 0.5, clickable: true, zIndex: 99,
  },
  claimed: (color) => ({
    strokeColor: color, strokeOpacity: 1, strokeWeight: 1,
    fillColor: color, fillOpacity: 0.7, clickable: false, zIndex: 2,
  }),
};

const MapWithClouds = forwardRef(({ onClaimCell, claimedCells, setMapRef, onZoomChanged }, ref) => {
  const [bounds, setBounds] = useState(null);
  const [hoveredCellKey, setHoveredCellKey] = useState(null);
  const mapInstanceRef = useRef(null);
  const particlesContainerRef = useRef(null);

  const onParticlesLoaded = useCallback(container => {
    particlesContainerRef.current = container;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerParticles(lat, lng) {
      if (particlesContainerRef.current && mapInstanceRef.current) {
        const projection = mapInstanceRef.current.getProjection();
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
  }, [setMapRef]);

  const handleIdle = () => {
    if (mapInstanceRef.current) {
      onZoomChanged(mapInstanceRef.current.getZoom());
      setBounds(mapInstanceRef.current.getBounds());
    }
  };

  const gridCells = useMemo(() => {
    if (!bounds) return [];
    const cells = [];
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const startLat = Math.floor(sw.lat() / GRID_SIZE) * GRID_SIZE;
    const startLng = Math.floor(sw.lng() / GRID_SIZE) * GRID_SIZE;

    for (let lat = startLat; lat < ne.lat() + GRID_SIZE; lat += GRID_SIZE) {
      for (let lng = startLng; lng < ne.lng() + GRID_SIZE; lng += GRID_SIZE) {
        const cellBounds = { north: lat + GRID_SIZE, south: lat, east: lng + GRID_SIZE, west: lng };
        cells.push(cellBounds);
      }
    }
    return cells;
  }, [bounds]);

  const getCellOptions = (cellBounds) => {
    const key = `${cellBounds.south}_${cellBounds.west}`;
    if (key === hoveredCellKey) return options.hover;
    if (claimedCells[key]) return options.claimed(claimedCells[key].color);
    return options.default;
  };

  return (
    <div style={mapRootStyle}>
      <Particles id="tsparticles" options={particlesOptions} onLoaded={onParticlesLoaded} style={particlesStyle} />
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['drawing']}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={18}
          options={{
            disableDefaultUI: true, gestureHandling: 'greedy', zoomControl: false,
            tilt: 0, 
            mapTypeId: 'roadmap', // Reverted to default roadmap,
          }}
          onLoad={handleMapLoad}
          onIdle={handleIdle}
        >
          {gridCells.map((cellBounds) => {
            const key = `${cellBounds.south}_${cellBounds.west}`;
            return (
              <Rectangle
                key={key}
                bounds={cellBounds}
                options={getCellOptions(cellBounds)}
                onMouseOver={() => setHoveredCellKey(key)}
                onMouseOut={() => setHoveredCellKey(null)}
                onClick={() => onClaimCell(cellBounds)}
              />
            );
          })}
          {Object.keys(claimedCells).map((key) => {
            const [lat, lng] = key.split('_').map(Number);
            const cellCenter = {
              lat: lat + GRID_SIZE / 2,
              lng: lng + GRID_SIZE / 2,
            };
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
