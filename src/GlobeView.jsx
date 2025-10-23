import React, {useRef, useState} from 'react';
import Globe from 'react-globe.gl';
import countriesData from './assets/countries.json';

const GlobeView = () => {
    const globeEl = useRef();
    const [hoveredPolygon, setHoveredPolygon] = useState(null);

    const handlePolygonClick = (polygon, event, {lat, lng}) => {
        console.log('Clicked on:', polygon);
        console.log(`Clicked coordinates: Lat: ${lat}, Lng: ${lng}`);
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
