import React, { memo } from 'react';

const counterStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '8px 20px',
  borderRadius: '9999px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '18px',
};

const iconStyle = {
  fontSize: '24px',
};

function CloudCounter({ count }) {
  return (
    <div style={counterStyle}>
      <span style={iconStyle}>☁️</span>
      <span>{count}</span>
    </div>
  );
}

export default memo(CloudCounter);
