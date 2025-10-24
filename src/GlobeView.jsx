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

        // --- Configuration for the multi-stage animation ---
        const panDuration = 1500;     // 1.5s to fly over the location
        const zoomDuration = 1500;    // 1.5s to zoom into the ground
        const fadeStartDelay = 1000;  // Start fade 1s into the zoom animation
        const finalNavDelay = panDuration + zoomDuration + 200; // Total animation time + buffer

        // --- Start Animation Sequence ---
        
        // 1. Stop autorotation immediately
        globeEl.current.controls().autoRotate = false;

        // 2. Phase 1: Pan to the location while staying high up.
        globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.5 }, panDuration);

        // 3. Use a timeout to chain the next animation phase.
        setTimeout(() => {
            // Phase 2: Zoom in to the location.
            // The altitude is set very low to simulate zooming to the minDistance.
            globeEl.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 0.01 }, zoomDuration);

            // Set another nested timeout to trigger the fade *during* the zoom.
            setTimeout(() => {
                setIsTransitioning(true); // This triggers the .fade-out CSS class
            }, fadeStartDelay);

        }, panDuration);

        // 4. Set a final timeout to navigate after the entire animation sequence is complete.
        setTimeout(() => {
            navigate(`/map/${coords.lat}/${coords.lng}`);
        }, finalNavDelay);
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
