import React, { useState, useRef } from 'react';
import MapWithClouds from './MapWithClouds.jsx';
import CloudCounter from './CloudCounter.jsx';
import Leaderboard from './Leaderboard.jsx';
import Compass from './Compass.jsx';
import RegistrationModal from './RegistrationModal.jsx';

// --- Style Objects ---
const appStyle = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
};

const topLeftControlsStyle = {
  position: 'absolute',
  top: '16px',
  left: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 50,
};

const controlButtonStyle = {
  width: '40px',
  height: '40px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
};

const topCenterContainerStyle = {
  position: 'absolute',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 50,
};

const topRightContainerStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 50,
};

const bottomRightContainerStyle = {
  position: 'absolute',
  bottom: '16px',
  right: '16px',
  zIndex: 50,
};


// --- Helper Function ---
const smoothAnimate = (map, target, duration) => {
  return new Promise((resolve) => {
    const start = {
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng(),
      zoom: map.getZoom(),
    };
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress * progress * (3 - 2 * progress);
      const current = {
        lat: start.lat + (target.lat - start.lat) * easeProgress,
        lng: start.lng + (target.lng - start.lng) * easeProgress,
        zoom: start.zoom + (target.zoom - start.zoom) * easeProgress,
      };
      map.moveCamera({ center: { lat: current.lat, lng: current.lng }, zoom: current.zoom });
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    animate();
  });
};

function App() {
  const [clouds, setClouds] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false); // New state for leaderboard
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef(null);
  const particlesRef = useRef(null);

  const handleMapClick = (newCloud) => {
    if (clouds > 0) {
      setClouds(clouds - 1);
      if (particlesRef.current) {
        particlesRef.current.triggerParticles(newCloud.lat, newCloud.lng);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRegister = () => {
    setClouds(10);
    setIsModalOpen(false);
  };

  const handleCompassClick = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (mapRef.current) {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            await smoothAnimate(mapRef.current, { ...userLocation, zoom: 18 }, 2500);
            await smoothAnimate(mapRef.current, { ...userLocation, zoom: 15 }, 1500);
          }
        },
        () => alert("無法取得您的位置資訊。"),
        { enableHighAccuracy: true }
      );
    } else {
      alert("您的瀏覽器不支援地理位置功能。");
    }
  };

  const handleZoomChanged = (newZoom) => {
    setZoom(newZoom);
  };

  // --- New handlers for top-left buttons ---
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleInfoClick = () => {
    alert('Chill Map: Click on the map to leave a cloud. Find your location with the compass.');
  };

  return (
    <div style={appStyle}>
      <MapWithClouds 
        ref={particlesRef}
        onMapClick={handleMapClick} 
        setMapRef={(map) => { mapRef.current = map; }}
        onZoomChanged={handleZoomChanged}
      />

      <div style={topLeftControlsStyle}>
        <button style={controlButtonStyle} onClick={handleZoomIn}>+</button>
        <button style={controlButtonStyle} onClick={handleZoomOut}>-</button>
        <button style={controlButtonStyle} onClick={handleInfoClick}>i</button>
      </div>

      <div style={topCenterContainerStyle}>
        <CloudCounter count={clouds} />
      </div>

      <div style={topRightContainerStyle}>
        {/* This button now opens the leaderboard modal */}
        <button style={controlButtonStyle} onClick={() => setIsLeaderboardOpen(true)}>🏆</button>
      </div>

      <div style={bottomRightContainerStyle}>
        <Compass onClick={handleCompassClick} />
      </div>

      {isModalOpen && (
        <RegistrationModal onClose={() => setIsModalOpen(false)} onRegister={handleRegister} />
      )}

      {/* Conditionally render Leaderboard as a modal */}
      {isLeaderboardOpen && (
        <Leaderboard 
          zoom={zoom} 
          onClose={() => setIsLeaderboardOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;