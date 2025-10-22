import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import { mapStyles } from "./map-styles.js";
import cloudImage from "./assets/cloud.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 25.0330,
  lng: 121.5654,
};

const particlesStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  pointerEvents: "none",
};

const MapWithClouds = forwardRef(({ onMapClick, setMapRef, onZoomChanged }, ref) => {
  const [cloudMarkers, setCloudMarkers] = useState([]);
  const mapInstanceRef = useRef(null);
  const particlesContainerRef = useRef(null);

  const onParticlesLoaded = useCallback(container => {
    particlesContainerRef.current = container;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerParticles(lat, lng) {
      if (particlesContainerRef.current && mapInstanceRef.current) {
        const projection = mapInstanceRef.current.getProjection();
        const point = projection.fromLatLngToPoint(new window.google.maps.LatLng(lat, lng));
        const domPoint = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(lat, lng));

        if (domPoint) {
          particlesContainerRef.current.addEmitter({
            position: {
              x: domPoint.x,
              y: domPoint.y,
            },
          });
        }
      }
    }
  }));

  const handleMapLoad = useCallback((map) => {
    mapInstanceRef.current = map;
    setMapRef(map);
  }, [setMapRef]);

  const handleMapClick = useCallback((event) => {
    const newCloud = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setCloudMarkers((currentMarkers) => [...currentMarkers, newCloud]);
    onMapClick(newCloud);
  }, [onMapClick]);

  const handleIdle = () => {
    if (mapInstanceRef.current && onZoomChanged) {
      const newZoom = mapInstanceRef.current.getZoom();
      onZoomChanged(newZoom);
    }
  };

  return (
    <div className="w-full h-full absolute top-0 left-0">
      <Particles
        id="tsparticles"
        options={particlesOptions}
        onLoaded={onParticlesLoaded}
        style={particlesStyle}
      />
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            gestureHandling: 'cooperative',
            zoomControl: false,
            tilt: 45,
          }}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          onIdle={handleIdle}
        >
          {cloudMarkers.map((cloud, index) => (
            <Marker
              key={index}
              position={{ lat: cloud.lat, lng: cloud.lng }}
              icon={{
                url: cloudImage,
                scaledSize: new window.google.maps.Size(50, 50),
              }}
              animation={window.google.maps.Animation.DROP}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
});

export default MapWithClouds;