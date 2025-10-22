import React from 'react';
import { OverlayView } from '@react-google-maps/api';

const styles = {
  pulseContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },
  dot: {
    width: '16px',
    height: '16px',
    backgroundColor: '#3B82F6',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 8px rgba(0,0,0,0.3)',
  },
  pulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    animation: 'pulse-animation 2s infinite',
    opacity: 0,
  },
};

// We need to inject the animation keyframes into the document's head
const keyframes = `
  @keyframes pulse-animation {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.7;
    }
    100% {
      transform: translate(-50%, -50%) scale(4);
      opacity: 0;
    }
  }
`;

// A simple component to inject styles once
const StyleInjector = () => {
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframes;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  return null;
};

const CurrentUserLocationMarker = ({ position }) => {
  return (
    <>
      <StyleInjector />
      <OverlayView
        position={position}
        mapPaneName={OverlayView.MARKER_LAYER}
      >
        <div style={styles.pulseContainer}>
          <div style={styles.pulse}></div>
          <div style={styles.dot}></div>
        </div>
      </OverlayView>
    </>
  );
};

export default CurrentUserLocationMarker;
