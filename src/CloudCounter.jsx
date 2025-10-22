// src/CloudCounter.jsx
import React from 'react';

const counterStyle = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    zIndex: '20', // 確保在粒子效果之上
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const cloudIconStyle = {
    fontSize: '24px'
}

function CloudCounter({ count }) {
    return (
        <div style={counterStyle}>
            <span style={cloudIconStyle}>☁️</span>
            <span>{count}</span>
        </div>
    );
}

export default CloudCounter;
