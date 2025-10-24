import React, { useState, memo } from 'react';

const baseStyle = {
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '50%',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  transition: 'transform 0.2s ease-in-out',
};

const iconStyle = {
  fontSize: '28px',
};

function Compass({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const compassStyle = {
    ...baseStyle,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
  };

  return (
    <button
      onClick={onClick}
      title="Reset View"
      style={compassStyle}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <span style={iconStyle}>🧭</span>
    </button>
  );
}

export default memo(Compass);
