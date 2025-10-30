import React, {useState, useRef, useEffect, useCallback, lazy, Suspense} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useJsApiLoader} from '@react-google-maps/api';
import MapWithClouds from './views/MapWithClouds.jsx';
import CloudCounter from './components/CloudCounter.jsx';
import Compass from './components/Compass.jsx';
import CellInfoWindow from './components/CellInfoWindow.jsx';
import {playClickSound} from './audioPlayer.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import { useAppStore } from './store.js';
import { smoothAnimate } from './map-animation.js';
import { useGeocoding } from './hooks/useGeocoding.js';

const Leaderboard = lazy(() => import('./components/Leaderboard.jsx'));
const RegistrationModal = lazy(() => import('./components/RegistrationModal.jsx'));
const InfoModal = lazy(() => import('./components/InfoModal.jsx'));

const GRID_SIZE = 0.0005;

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
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    bottomRightContainer: {
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 50,
    },
};

function App() {
    const { lat, lng } = useParams();
    const navigate = useNavigate();
    
    const [center, setCenter] = useState(() => {
        if (lat && lng) {
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
        return null;
    });

    const [isReturning, setIsReturning] = useState(false);
    const mapRef = useRef(null);

    const claimedCells = useAppStore(state => state.claimedCells);
    const exploredCells = useAppStore(state => state.exploredCells);
    const selectedCell = useAppStore(state => state.selectedCell);
    const userLocation = useAppStore(state => state.userLocation);
    const initializeGeolocation = useAppStore(state => state.initializeGeolocation);
    const selectCell = useAppStore(state => state.selectCell);
    const claimSelectedCell = useAppStore(state => state.claimSelectedCell);
    const register = useAppStore(state => state.register);

    // --- HOOKS ---
    useGeocoding(selectedCell); // Geocoding logic is now self-contained in this hook

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        initializeGeolocation();
    }, [initializeGeolocation]);

    useEffect(() => {
        if (center) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setCenter({ lat: 25.033, lng: 121.5654 });
            }
        );
    }, [center]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [zoom, setZoom] = useState(10);

    const setMapRef = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const handleSelectCell = useCallback((key, position) => {
        playClickSound();
        selectCell(key ? { key, position, isLoading: true } : null);
    }, [selectCell]);

    const handleClaimCell = useCallback(() => {
        const result = claimSelectedCell();
        if (result === 'no-clouds') {
            setIsModalOpen(true);
        }
    }, [claimSelectedCell]);

    const handleRegister = useCallback(() => {
        register();
        setIsModalOpen(false);
    }, [register]);

    const handleReturnToGlobe = useCallback(async () => {
        if (!mapRef.current) return;
        const currentCenter = mapRef.current.getCenter();
        const lat = currentCenter.lat();
        const lng = currentCenter.lng();
        setIsReturning(true);
        await smoothAnimate(mapRef.current, { lat, lng }, 1500, 2);
        navigate('/', { state: { lat, lng } });
    }, [navigate]);

    const handleCompassClick = useCallback(async () => {
        if (userLocation && mapRef.current) {
            const map = mapRef.current;
            const currentCenter = map.getCenter();
            const currentCenterLiteral = { lat: currentCenter.lat(), lng: currentCenter.lng() };
            await smoothAnimate(map, currentCenterLiteral, 1000, 5);
            await smoothAnimate(map, userLocation, 1500, 5);
            await smoothAnimate(map, userLocation, 1000, 15);
        } else {
            alert("無法取得您的位置資訊。請確認已授權瀏覽器存取您的位置。");
        }
    }, [userLocation]);

    const handleZoomChanged = useCallback((newZoom) => {
        setZoom(newZoom);
    }, []);

    const handleCenterChanged = useCallback((newCenter) => {
        navigate(`/map/${newCenter.lat.toFixed(7)}/${newCenter.lng.toFixed(7)}`, { replace: true });
    }, [navigate]);

    const handleZoomIn = useCallback(() => {
        if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }, []);

    const handleZoomOut = useCallback(() => {
        if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }, []);

    const handleInfoClick = useCallback(() => setIsInfoModalOpen(true), []);
    const handleCloseRegistrationModal = useCallback(() => setIsModalOpen(false), []);
    const handleCloseLeaderboard = useCallback(() => setIsLeaderboardOpen(false), []);
    const handleCloseInfoModal = useCallback(() => setIsInfoModalOpen(false), []);

    if (!isLoaded || !center) {
        return <LoadingScreen />;
    }

    return (
        <div style={styles.app} className={isReturning ? 'map-container-fade-out' : ''}>
            <MapWithClouds
                center={center}
                onSelectCell={handleSelectCell}
                claimedCells={claimedCells}
                exploredCells={exploredCells}
                setMapRef={setMapRef}
                onZoomChanged={handleZoomChanged}
                onCenterChanged={handleCenterChanged}
                selectedCell={selectedCell}
                userLocation={userLocation}
            />

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
                <CloudCounter />
            </div>

            <div style={styles.topRightContainer}>
                <button style={styles.controlButton} onClick={() => setIsLeaderboardOpen(true)}>🏆</button>
                <button style={styles.controlButton} onClick={handleReturnToGlobe} title="Return to Globe">🌍</button>
            </div>

            <div style={styles.bottomRightContainer}>
                <Compass onClick={handleCompassClick}/>
            </div>

            <Suspense fallback={<LoadingScreen />}>
                {isModalOpen && (
                    <RegistrationModal onClose={handleCloseRegistrationModal} onRegister={handleRegister}/>
                )}
                {isLeaderboardOpen && (
                    <Leaderboard onClose={handleCloseLeaderboard}/>
                )}
                {isInfoModalOpen && (
                    <InfoModal onClose={handleCloseInfoModal}/>
                )}
            </Suspense>
        </div>
    );
}

export default App;
