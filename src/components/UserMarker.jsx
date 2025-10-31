import React, { memo } from 'react';
import { OverlayView } from '@react-google-maps/api';

// --- CSS Animation Keyframes for the hover effect ---
const keyframes = `
  @keyframes shake {
    0%, 100% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    25% {
      transform: translate(-50%, -50%) rotate(-5deg) scale(1.1);
    }
    75% {
      transform: translate(-50%, -50%) rotate(5deg) scale(1.1);
    }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);

const styles = {
  container: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    padding: '3px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      animation: 'shake 0.5s infinite',
    },
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
};

// A simple component to handle the hover animation with CSS-in-JS
const UserMarkerContainer = (props) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyle = isHovered ? { animation: 'shake 0.5s infinite' } : {};

  return (
    <div
      style={{ ...styles.container, ...hoverStyle }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {props.children}
    </div>
  );
};


const UserMarker = ({ position, avatarUrl }) => {
  // Use a default avatar if the URL is empty
  const finalAvatarUrl = avatarUrl || 'https://www.gravatar.com/avatar/?d=mp';

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <UserMarkerContainer>
        <img src={finalAvatarUrl} alt="User Avatar" style={styles.avatar} />
      </UserMarkerContainer>
    </OverlayView>
  );
};

export default memo(UserMarker);
