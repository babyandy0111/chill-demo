import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { geoCentroid } from 'd3-geo';
import countriesData from './assets/countries.json';
import earthImage from './assets/earth-8k.jpg';
import capitalsData from './assets/capitals.json'; // Import the new capitals data

// Create a reverse map from the feature object itself to its properties for reliable lookup
const featureMap = new Map(
    countriesData.features.map(feature => [feature, feature.properties])
);

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.1;
            globeEl.current.controls().minDistance = 1;
            globeEl.current.controls().maxDistance = 250;
        }
    }, []);

    const transitionToMap = (coords) => {
        if (!globeEl.current || isTransitioning) return;

        setIsTransitioning(true);

        // 1. Stop autorotate and point camera to the location
        globeEl.current.controls().autoRotate = false;
        // Slower, more cinematic swoop animation (2.5 seconds)
        globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 0.5 }, 2500); 

        // 2. After a delay, navigate
        // Delay is slightly longer than the animation to allow fade-out to complete
        setTimeout(() => {
            navigate(`/map/${coords.lat}/${coords.lng}`);
        }, 2700);
    };

    const handlePolygonClick = (polygon, event, { lat, lng }) => {
        transitionToMap({ lat, lng });
    };

    // Memoize the combined data for HTML elements (hover flag + capital flags)
    const htmlElementsData = useMemo(() => {
        // Data for hovered country flag
        const hoverFlag = (() => {
            if (!hoveredPolygon) return null;
            const properties = featureMap.get(hoveredPolygon);
            if (!properties) return null;
            const centroid = geoCentroid(hoveredPolygon);
            const iso2 = properties.iso_a2;
            return {
                lat: centroid[1],
                lng: centroid[0],
                iso2: iso2,
                name: properties.name,
                isHover: true, // Differentiator
            };
        })();

        // Data for capital city flags from our new file
        const capitalFlags = capitalsData.map(city => ({
            lat: city.lat,
            lng: city.lng,
            iso2: city.iso2,
            name: `${city.name}, ${city.country}`,
            isHover: false, // Differentiator
        }));

        return [
            ...capitalFlags,
            ...(hoverFlag ? [hoverFlag] : []) // Add hover flag if it exists
        ].filter(d => d.iso2 && d.iso2 !== '-99');

    }, [hoveredPolygon]);


    return (
        <div className={`view-container ${isTransitioning ? 'fade-out' : ''}`}>
            <Globe
                ref={globeEl}
                globeImageUrl={earthImage}

                // Polygons (Countries)
                polygonsData={countriesData.features}
                polygonCapColor={p => p === hoveredPolygon ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
                polygonStrokeColor={p => p === hoveredPolygon ? '#fff' : 'rgba(0, 0, 0, 0.1)'}
                onPolygonHover={setHoveredPolygon}
                onPolygonClick={handlePolygonClick}
                polygonsTransitionDuration={300}
                polygonResolution={3}
                polygonAltitude={0.005}

                // HTML Elements (Flags)
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
        </div>
    );
};

export default GlobeView;
