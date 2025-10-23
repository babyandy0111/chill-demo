import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import countriesData from './assets/countries.json';

const GlobeView = () => { // Removed onCountryClick from props
  const globeEl = useRef();
  const [hoveredPolygon, setHoveredPolygon] = useState(null);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.15;
      globeEl.current.controls().minDistance = 250;
      globeEl.current.controls().maxDistance = 500;
    }
  }, []);

  const handlePolygonClick = (polygon) => {
    const event = new CustomEvent('countryClicked', { detail: polygon });
    window.dispatchEvent(event);
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
      onPolygonClick={handlePolygonClick} // Use the new handler
      polygonsTransitionDuration={300}
    />
  );
};

export default GlobeView;