import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import countriesData from './assets/countries.json';
import capitalsData from './assets/capitals.json';
import earthImage from './assets/earth-8k.jpg';

// Create a mapping from 3-letter code to 2-letter code
const countryCodeMap = new Map(
    countriesData.features.map(country => [
        country.properties.ISO_A3,
        country.properties.ISO_A2
    ])
);

// Convert capitals data and add the 2-letter code
const capitals = Object.keys(capitalsData).map(code => ({
    code,
    iso2: countryCodeMap.get(code), // Get the 2-letter code from the map
    ...capitalsData[code]
}));

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.15;
            globeEl.current.controls().minDistance = 250;
            globeEl.current.controls().maxDistance = 500;
        }
    }, []);

    const handlePolygonClick = (polygon, event, { lat, lng }) => {
        navigate(`/map/${lat}/${lng}`);
    };

    return (
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

            // Render flags as HTML elements
            htmlElementsData={capitals.filter(d => d.iso2)} // Filter out any capitals without a matching 2-letter code
            htmlElement={d => {
                const el = document.createElement('img');
                el.src = `https://flagcdn.com/w20/${d.iso2.toLowerCase()}.png`;
                el.title = d.name; // Show capital name on hover
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
