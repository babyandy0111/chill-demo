// src/Compass.jsx
import React from 'react';

const compassStyle = {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 20,
    transition: 'transform 0.2s ease-in-out',
};

const compassIconStyle = {
    fontSize: '28px',
    color: '#333',
};

function Compass({ onClick }) {
    return (
        <div
            style={compassStyle}
            onClick={onClick}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="回到中心"
        >
            <span style={compassIconStyle}>🧭</span>
        </div>
    );
}

export default Compass;
