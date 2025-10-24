import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { geoCentroid } from 'd3-geo';
import countriesData from './assets/countries.json';
import earthImage from './assets/earth-8k.jpg';
import capitalsData from './assets/capitals.json';
import Leaderboard from './Leaderboard.jsx';

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
    const location = useLocation();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (globeEl.current) {
            const { state } = location;
            if (state && state.lat && state.lng) {
                // Coming back from map, point to the location
                globeEl.current.pointOfView({ lat: state.lat, lng: state.lng, altitude: 1.5 });
                globeEl.current.controls().autoRotate = false;
            } else {
                // Initial load
                globeEl.current.controls().autoRotate = true;
            }

            globeEl.current.controls().autoRotateSpeed = 0.1;
            globeEl.current.controls().minDistance = 150;
            globeEl.current.controls().maxDistance = 250;
        }
    }, [location]);

    const transitionToMap = (coords) => {
        if (!globeEl.current || isTransitioning) return;
        const panDuration = 1500;
        const zoomDuration = 1500;
        const fadeStartDelay = 1000;
        const finalNavDelay = panDuration + zoomDuration + 200;

        globeEl.current.controls().autoRotate = false;
        globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.5 }, panDuration);

        setTimeout(() => {
            globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 0.01 }, zoomDuration);
            setTimeout(() => {
                setIsTransitioning(true);
            }, fadeStartDelay);
        }, panDuration);

        setTimeout(() => {
            navigate(`/map/${coords.lat}/${coords.lng}`);
        }, finalNavDelay);
    };

    const handlePolygonClick = (polygon, event, { lat, lng }) => {
        transitionToMap({ lat, lng });
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
                polygonsData={countriesData.features}
                polygonCapColor={p => p === hoveredPolygon ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
                polygonStrokeColor={p => p === hoveredPolygon ? '#fff' : 'rgba(0, 0, 0, 0.1)'}
                onPolygonHover={setHoveredPolygon}
                onPolygonClick={handlePolygonClick}
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
                        el.onclick = () => transitionToMap({ lat: d.lat, lng: d.lng });
                        return el;
                    }

                    // For capital cities, create the full marker with a pole
                    const markerEl = document.createElement('div');
                    markerEl.className = 'flag-marker';
                    markerEl.title = d.name;
                    markerEl.style.cursor = 'pointer';
                    markerEl.style.pointerEvents = 'auto';
                    markerEl.onclick = () => transitionToMap({ lat: d.lat, lng: d.lng });

                    const flagImg = document.createElement('img');
                    flagImg.src = `https://flagcdn.com/w20/${d.iso2.toLowerCase()}.png`;

                    const poleEl = document.createElement('div');
                    poleEl.className = 'flag-pole';

                    markerEl.appendChild(flagImg);
                    markerEl.appendChild(poleEl);

                    return markerEl;
                }}
            />

            {isLeaderboardOpen && <Leaderboard onClose={() => setIsLeaderboardOpen(false)}/>}
        </div>
    );
};

export default GlobeView;
