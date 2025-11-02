import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { geoCentroid } from 'd3-geo';
import * as THREE from 'three';
import countriesData from '../assets/countries.json';
import earthImage from '../assets/earth-8k.webp';
import capitalsData from '../assets/capitals.json';
import Leaderboard from '../components/Leaderboard.jsx';
import cloudsTexture from '../assets/clouds.png';

const featureMap = new Map(
    countriesData.features.map(feature => [feature, feature.properties])
);

const styles = {
    topRightContainer: {
        position: 'absolute',
        top: '16px',
        right: '16px',
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
};

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const navigate = useNavigate();
    const [cloudLayer, setCloudLayer] = useState(null);


    useEffect(() => {
        // Create cloud layer
        const globeRadius = 100; // react-globe.gl default radius
        const cloudGeometry = new THREE.SphereGeometry(globeRadius + 1.5, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load(cloudsTexture),
            transparent: true,
            opacity: 0.6,
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        clouds.raycast = () => {}; // Make clouds permanently click-through
        setCloudLayer(clouds);
    }, []);


    useEffect(() => {
        if (globeEl.current) {
            const transitionDuration = 2000; // 2 seconds for a smooth flight

            // New logic: Prioritize localStorage for returning view
            const lastKnownLocation = localStorage.getItem('lastKnownLocation');

            if (lastKnownLocation) {
                try {
                    const { lat, lng } = JSON.parse(lastKnownLocation);
                    // Case 1: Coming back from map view. Point to the last location.
                    globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, transitionDuration);
                    globeEl.current.controls().autoRotate = false;
                } catch {
                    // Fallback if localStorage is corrupted
                    globeEl.current.controls().autoRotate = true;
                }
            } else {
                // Case 2: Initial load. Ask for GPS.
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Success: User granted permission.
                        const { latitude, longitude } = position.coords;
                        globeEl.current.pointOfView({ lat: latitude, lng: longitude, altitude: 1.5 }, transitionDuration);
                        globeEl.current.controls().autoRotate = false;
                    },
                    () => {
                        // Failure: User denied or error occurred. Fallback to auto-rotation.
                        globeEl.current.controls().autoRotate = true;
                    },
                    {
                        enableHighAccuracy: true, // 啟用高精確度模式
                        timeout: 10000,           // 設定超時時間為 10 秒
                        maximumAge: 0             // 不使用緩存的舊位置
                    }
                );
            }

            // Common settings
            globeEl.current.controls().autoRotateSpeed = 0.1;
            globeEl.current.controls().minDistance = 1;
            globeEl.current.controls().maxDistance = 250;
        }
    }, []); // Run only once on mount

    const handleGlobeClick = ({ lat, lng }) => {
        if (!globeEl.current || isTransitioning) return;

        const transitionDuration = 1500; // 2 seconds

        // 1. Animate the globe to fly into the clicked point
        globeEl.current.controls().autoRotate = false;
        globeEl.current.pointOfView({ lat, lng, altitude: 0.05 }, transitionDuration);

        // 2. Set a timeout to navigate exactly when the animation finishes
        setTimeout(() => {
            setIsTransitioning(true); // Trigger fade-out CSS effect
            // A small delay for the fade-out to start before navigating
            setTimeout(() => {
                // New: Save location to localStorage and navigate to the simple /map route
                try {
                    localStorage.setItem('lastKnownLocation', JSON.stringify({ lat, lng }));
                } catch (error) {
                    console.error("Could not write to localStorage:", error);
                }
                navigate('/map');
            }, 100);
        }, transitionDuration);
    };

    const htmlElementsData = useMemo(() => {
        const hoverFlag = (() => {
            if (!hoveredPolygon) return null;
            const properties = featureMap.get(hoveredPolygon);
            if (!properties) return null;
            const centroid = geoCentroid(hoveredPolygon);
            const iso2 = properties.iso_a2;
            return { lat: centroid[1], lng: centroid[0], iso2: iso2, name: properties.name, isHover: true };
        })();

        const capitalFlags = capitalsData.map(city => ({
            lat: city.lat,
            lng: city.lng,
            iso2: city.iso2,
            name: `${city.name}, ${city.country}`,
            isHover: false,
        }));

        return [...capitalFlags, ...(hoverFlag ? [hoverFlag] : [])].filter(d => d.iso2 && d.iso2 !== '-99');
    }, [hoveredPolygon]);

    return (
        <div className={`view-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            <div style={styles.topRightContainer}>
                <button style={styles.controlButton} onClick={() => setIsLeaderboardOpen(true)}>🏆</button>
            </div>

            <Globe
                ref={globeEl}
                globeImageUrl={earthImage}
                onGlobeClick={handleGlobeClick}
                polygonsData={countriesData.features}
                polygonCapColor={p => p === hoveredPolygon ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
                polygonStrokeColor={p => p === hoveredPolygon ? '#fff' : 'rgba(0, 0, 0, 0.1)'}
                onPolygonHover={setHoveredPolygon}
                onPolygonClick={(polygon, event, { lat, lng }) => handleGlobeClick({ lat, lng })}
                polygonsTransitionDuration={300}
                polygonResolution={3}
                polygonAltitude={0.005}
                htmlElementsData={htmlElementsData}
                htmlElement={d => {
                    // For the hover flag, keep it as a simple image without the pole/animation
                    if (d.isHover) {
                        const el = document.createElement('img');
                        el.src = `https://flagcdn.com/w20/${d.iso2.toLowerCase()}.png`;
                        el.title = d.name;
                        el.style.width = '20px';
                        el.style.cursor = 'pointer';
                        el.style.pointerEvents = 'auto';
                        el.onclick = (e) => {
                            e.stopPropagation(); // Prevent globe click from firing
                            handleGlobeClick({ lat: d.lat, lng: d.lng });
                        };
                        return el;
                    }

                    // For capital cities, create the full marker with a pole
                    const markerEl = document.createElement('div');
                    markerEl.className = 'flag-marker';
                    markerEl.title = d.name;
                    markerEl.style.cursor = 'pointer';
                    markerEl.style.pointerEvents = 'auto';
                    markerEl.onclick = (e) => {
                        e.stopPropagation(); // Prevent globe click from firing
                        handleGlobeClick({ lat: d.lat, lng: d.lng });
                    };

                    const flagImg = document.createElement('img');
                    flagImg.src = `https://flagcdn.com/w20/${d.iso2.toLowerCase()}.png`;

                    const poleEl = document.createElement('div');
                    poleEl.className = 'flag-pole';

                    markerEl.appendChild(flagImg);
                    markerEl.appendChild(poleEl);

                    return markerEl;
                }}
                customLayerData={cloudLayer ? [{}] : []}
                customThreeObject={() => cloudLayer}
                customThreeObjectUpdate={obj => {
                    // Sync with globe rotation and add independent rotation
                    if (globeEl.current) {
                        obj.rotation.y += 0.0003;
                    }
                }}
            />

            {isLeaderboardOpen && <Leaderboard onClose={() => setIsLeaderboardOpen(false)}/>}
        </div>
    );
};

export default GlobeView;