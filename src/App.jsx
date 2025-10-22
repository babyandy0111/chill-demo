import React, { useState, useRef } from 'react';
import MapWithClouds from './MapWithClouds.jsx';
import CloudCounter from './CloudCounter.jsx';
import Leaderboard from './Leaderboard.jsx';
import Compass from './Compass.jsx';
import RegistrationModal from './RegistrationModal.jsx';
import InfoModal from './InfoModal.jsx';
import CellInfoWindow from './CellInfoWindow.jsx'; // Import the new component
import { playClickSound } from './audioPlayer.js';

const styles = {
  app: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
  },
  topLeftControls: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 50,
  },
  controlButton: {
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
  },
  topCenterContainer: {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
  },
  topRightContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 50,
  },
  bottomRightContainer: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    zIndex: 50,
  },
};

const smoothAnimate = (map, targetCenter, duration, targetZoom = null) => {
  return new Promise((resolve) => {
    const startCenter = map.getCenter();
    const startZoom = map.getZoom();
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress * progress * (3 - 2 * progress);
      const currentCenter = {
        lat: startCenter.lat() + (targetCenter.lat - startCenter.lat()) * easeProgress,
        lng: startCenter.lng() + (targetCenter.lng - startCenter.lng()) * easeProgress,
      };
      const currentZoom = targetZoom !== null ? startZoom + (targetZoom - startZoom) * easeProgress : startZoom;
      map.moveCamera({ center: currentCenter, zoom: currentZoom });
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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [claimedCells, setClaimedCells] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // State for the user's location marker
  const mapRef = useRef(null);

  // This function is now async to handle the geocoding API call.
  const handleSelectCell = async (key, position) => {
    // Close window if clicking away or on a claimed cell.
    if (!key || (selectedCell && selectedCell.key === key) || claimedCells[key]) {
      setSelectedCell(null);
      return;
    }

    // Play sound on new cell selection
    playClickSound();

    // Immediately show the window in a loading state.
    setSelectedCell({ key, position, isLoading: true });

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: position });

      if (response.results && response.results[0]) {
        const address = response.results[0].address_components;
        const country = address.find(c => c.types.includes('country'));
        const region = address.find(c => c.types.includes('administrative_area_level_1'));

        const countryName = country ? country.long_name : '未知水域';
        const countryCode = country ? country.short_name.toLowerCase() : null;
        const regionName = region ? region.long_name : '';
        
        const flagUrl = countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : null;

        // Update the state with the fetched information.
        setSelectedCell({ key, position, isLoading: false, countryName, regionName, flagUrl });
      } else {
        setSelectedCell({ key, position, isLoading: false, countryName: '無法取得地點資訊', regionName: '', flagUrl: null });
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setSelectedCell({ key, position, isLoading: false, countryName: '地理資訊查詢失敗', regionName: '', flagUrl: null });
    }
  };

  // This function is called when the "Occupy" button is clicked
  const handleClaimCell = () => {
    if (!selectedCell) return;
    const { key } = selectedCell;

    if (clouds > 0) {
      setClouds(clouds - 1);
      setClaimedCells(prev => ({
        ...prev,
        [key]: { owner: 'user', color: '#3B82F6' }
      }));
      setSelectedCell(null); // Hide the info window after claiming
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
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Set the user location to show the marker
          setUserLocation(location);

          if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            await smoothAnimate(mapRef.current, location, 1500);
            if (currentZoom < 15) {
              await smoothAnimate(mapRef.current, location, 2000, 15);
            }
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

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleInfoClick = () => {
    setIsInfoModalOpen(true);
  };

  return (
    <div style={styles.app}>
      <MapWithClouds 
        onSelectCell={handleSelectCell}
        claimedCells={claimedCells}
        setMapRef={(map) => { mapRef.current = map; }}
        onZoomChanged={handleZoomChanged}
        selectedCell={selectedCell}
        onClaim={handleClaimCell}
        userLocation={userLocation} // Pass the user location state down
      />

      {/* The CellInfoWindow is now a simple UI component rendered at the App level */}
      {selectedCell && (
        <CellInfoWindow
          cellInfo={selectedCell}
          onClaim={handleClaimCell}
        />
      )}

      <div style={styles.topLeftControls}>
        <button style={styles.controlButton} onClick={handleZoomIn}>+</button>
        <button style={styles.controlButton} onClick={handleZoomOut}>-</button>
        <button style={styles.controlButton} onClick={handleInfoClick}>i</button>
      </div>

      <div style={styles.topCenterContainer}>
        <CloudCounter count={clouds} />
      </div>

      <div style={styles.topRightContainer}>
        <button style={styles.controlButton} onClick={() => setIsLeaderboardOpen(true)}>🏆</button>
      </div>

      <div style={styles.bottomRightContainer}>
        <Compass onClick={handleCompassClick} />
      </div>

      {isModalOpen && (
        <RegistrationModal onClose={() => setIsModalOpen(false)} onRegister={handleRegister} />
      )}

      {isLeaderboardOpen && (
        <Leaderboard onClose={() => setIsLeaderboardOpen(false)} />
      )}

      {isInfoModalOpen && (
        <InfoModal onClose={() => setIsInfoModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
