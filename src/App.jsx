import React, { useState, useRef } from 'react';
import MapWithClouds from './MapWithClouds.jsx';
import CloudCounter from './CloudCounter.jsx';
import Leaderboard from './Leaderboard.jsx';
import Compass from './Compass.jsx';
import RegistrationModal from './RegistrationModal.jsx';

// --- 輔助函式：實現平滑動畫 ---
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
      const easeProgress = progress * progress * (3 - 2 * progress); // ease-in-out

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
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef(null);
  const particlesRef = useRef(null); // Ref for particle controls

  const handleMapClick = (newCloud) => {
    if (clouds > 0) {
      setClouds(clouds - 1);
      // Trigger particle effect via the ref
      if (particlesRef.current) {
        particlesRef.current.triggerParticles(newCloud.lat, newCloud.lng);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRegister = () => {
    setClouds(10); // Reward after registration
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
            // 俯衝再拉遠的動畫
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

  return (
    <div className="relative w-screen h-screen">
      {/* Map Component */}
      <MapWithClouds 
        ref={particlesRef}
        onMapClick={handleMapClick} 
        setMapRef={(map) => { mapRef.current = map; }}
        onZoomChanged={handleZoomChanged}
      />

      {/* Top-Left Controls */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
        <button className="w-10 h-10 bg-white bg-opacity-80 rounded-full shadow-md flex items-center justify-center text-xl font-bold">+</button>
        <button className="w-10 h-10 bg-white bg-opacity-80 rounded-full shadow-md flex items-center justify-center text-xl font-bold">-</button>
        <button className="w-10 h-10 bg-white bg-opacity-80 rounded-full shadow-md flex items-center justify-center text-xl font-bold">i</button>
      </div>

      {/* Top-Center Cloud Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <CloudCounter count={clouds} />
      </div>

      {/* Top-Right Leaderboard & Account */}
      <div className="absolute top-4 right-4 z-10">
        <Leaderboard zoom={zoom} />
      </div>

      {/* Bottom-Right Compass */}
      <div className="absolute bottom-4 right-4 z-10">
        <Compass onClick={handleCompassClick} />
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <RegistrationModal onClose={() => setIsModalOpen(false)} onRegister={handleRegister} />
      )}
    </div>
  );
}

export default App;