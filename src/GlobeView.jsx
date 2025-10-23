import React, {useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { geoCentroid } from 'd3-geo'; // Import geoCentroid
import countriesData from './assets/countries.json';
import earthImage from './assets/earth-8k.jpg';

// Create a reliable mapping from 3-letter code (ISO_A3) to 2-letter code (ISO_A2)
const countryCodeMap = new Map(
    countriesData.features.map(country => [
        country.properties.iso_a3,
        country.properties.iso_a2
    ])
);

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.05;
            globeEl.current.controls().minDistance = 50;
            globeEl.current.controls().maxDistance = 250;
        }
    }, []);

    const handlePolygonClick = (polygon, event, { lat, lng }) => {
        navigate(`/map/${lat}/${lng}`);
    };

    // Generate flag data only for the hovered country
    const flagData = useMemo(() => {
        if (!hoveredPolygon) return [];

        const centroid = geoCentroid(hoveredPolygon);
        const iso3 = hoveredPolygon.properties.iso_a3;
        const iso2 = countryCodeMap.get(iso3); // Look up the correct 2-letter code

        return [{
            iso2: iso2,
            name: hoveredPolygon.properties.name,
            lat: centroid[1],
            lng: centroid[0],
        }];
    }, [hoveredPolygon]);

    return (
        <>
            {/*<div style={{*/}
            {/*    position: 'absolute',*/}
            {/*    top: '10px',*/}
            {/*    left: '10px',*/}
            {/*    backgroundColor: 'rgba(0,0,0,0.7)',*/}
            {/*    color: 'white',*/}
            {/*    padding: '10px',*/}
            {/*    zIndex: 1000,*/}
            {/*    fontFamily: 'monospace',*/}
            {/*    pointerEvents: 'none'*/}
            {/*}}>*/}
            {/*    <div>Hovered Country: {hoveredPolygon ? hoveredPolygon.properties.name : 'None'}</div>*/}
            {/*    <div>ISO A3: {hoveredPolygon ? hoveredPolygon.properties.iso_a3 : 'N/A'}</div>*/}
            {/*    <div>ISO A2: {hoveredPolygon ? hoveredPolygon.properties.iso_a2 : 'N/A'}</div>*/}
            {/*</div>*/}
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

                // Render flag only for the hovered country
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
        </>
    );
};

export default GlobeView;
