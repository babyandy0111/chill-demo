import React, {useRef} from 'react';
import {Viewer} from 'resium';
import * as Cesium from 'cesium';

// It's good practice to set the access token.
// This can be a free token from cesium.com/ion.
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMmM5OWI1NS0zMjY5LTRjZjUtYWY5MS05OTFiZWY0MDY0ZmUiLCJpZCI6MzUzMjkxLCJpYXQiOjE3NjEyMDkzNzh9.zkm4G7TqkZn9jwXbMJuheAzqa5HebRr8daQ2Iifn1fI';

const CesiumGlobe = () => {
    const viewerRef = useRef(null);

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
        </Viewer>
    );
};

export default CesiumGlobe;
