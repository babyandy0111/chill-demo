import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
import Globe from 'react-globe.gl';
import countriesData from './assets/countries.json';

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);
    const navigate = useNavigate(); // Initialize the navigate function

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.15;
            globeEl.current.controls().minDistance = 250;
            globeEl.current.controls().maxDistance = 500;
        }
    }, []);

    const handlePolygonClick = (polygon, event, {lat, lng}) => {
        // Navigate to the map view with the clicked coordinates
        navigate(`/map/${lat}/${lng}`);
    };

    return (
        <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

            polygonsData={countriesData.features}
            polygonCapColor={p => p === hoveredPolygon ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
            polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
            polygonStrokeColor={p => p === hoveredPolygon ? '#fff' : 'rgba(0, 0, 0, 0.1)'}
            onPolygonHover={setHoveredPolygon}
            onPolygonClick={handlePolygonClick}
            polygonsTransitionDuration={300}
        />
    );
};

export default GlobeView;
