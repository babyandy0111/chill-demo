import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { geoCentroid } from 'd3-geo';
import countriesData from './assets/countries.json';
import earthImage from './assets/earth-8k.jpg';
import citiesData from './assets/world_cities.json'; // Import city data

// Create a reverse map from the feature object itself to its properties for reliable lookup
const featureMap = new Map(
    countriesData.features.map(feature => [feature, feature.properties])
);

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.15;
            globeEl.current.controls().minDistance = 150;
            globeEl.current.controls().maxDistance = 500;
        }
    }, []);

    const handlePolygonClick = (polygon, event, { lat, lng }) => {
        navigate(`/map/${lat}/${lng}`);
    };

    // Generate flag data only for the hovered country using the reliable feature map
    const flagData = useMemo(() => {
        if (!hoveredPolygon) return [];

        const properties = featureMap.get(hoveredPolygon); // Look up the correct properties
        if (!properties) return [];

        const centroid = geoCentroid(hoveredPolygon);
        const iso2 = properties.iso_a2; // Use lowercase 'iso_a2'

        return [{
            iso2: iso2,
            name: properties.name, // Use lowercase 'name'
            lat: centroid[1],
            lng: centroid[0],
        }];
    }, [hoveredPolygon]);

    return (
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

            // Labels (Cities)
            labelsData={citiesData}
            labelLat={d => d.lat}
            labelLng={d => d.lng}
            labelText={d => d.name}
            labelSize={d => Math.sqrt(d.pop) * 4e-4}
            labelDotRadius={d => Math.sqrt(d.pop) * 4e-4}
            labelColor={() => 'rgba(255, 165, 0, 0.75)'}
            labelResolution={2}
            onLabelClick={d => navigate(`/map/${d.lat}/${d.lng}`)}
            labelAltitude={0.01}

            // HTML Elements (Flags on hover)
            htmlElementsData={flagData.filter(d => d.iso2 && d.iso2 !== '-99')}
            htmlElement={d => {
                const el = document.createElement('img');
                el.src = `https://flagcdn.com/w20/${d.iso2.toLowerCase()}.png`;
                el.title = d.name; // Show country name on hover
                el.style.width = '20px';
                el.style.cursor = 'pointer';
                el.style.pointerEvents = 'auto'; // Allow mouse events
                el.onclick = () => navigate(`/map/${d.lat}/${d.lng}`);
                return el;
            }}
        />
    );
};

export default GlobeView;
