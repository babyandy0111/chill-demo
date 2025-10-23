import React, { useRef } from 'react';
import { Viewer, Globe } from 'resium';
import * as Cesium from 'cesium';

// It's good practice to set the access token.
// This can be a free token from cesium.com/ion.
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMmM5OWI1NS0zMjY5LTRjZjUtYWY5MS05OTFiZWY0MDY0ZmUiLCJpZCI6MzUzMjkxLCJpYXQiOjE3NjEyMDkzNzh9.zkm4G7TqkZn9jwXbMJuheAzqa5HebRr8daQ2Iifn1fI';

const CesiumGlobe = ({ onGlobeClick }) => {
  const viewerRef = useRef(null);

  const handleGlobeClick = (movement) => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const ray = viewer.camera.getPickRay(movement.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);

      if (Cesium.defined(cartesian)) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        
        // Pass the coordinates to the parent component
        onGlobeClick({ lng: longitude, lat: latitude });
      }
    }
  };

  return (
    <Viewer
      full
      ref={viewerRef}
      animation={false}
      baseLayerPicker={true}
      fullscreenButton={false}
      geocoder={false}
      homeButton={false}
      infoBox={false}
      sceneModePicker={false}
      selectionIndicator={false}
      timeline={false}
      navigationHelpButton={false}
    >
      <Globe onClick={handleGlobeClick} />
    </Viewer>
  );
};

export default CesiumGlobe;
