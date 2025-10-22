import React, { useState } from 'react';

// --- Style Objects ---
const overlayStyle = {
  position: 'fixed',
  inset: '0px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
};

const leaderboardStyle = {
  position: 'relative', // For positioning the close button
  width: '280px', // A bit wider for better layout
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  padding: '20px',
  fontFamily: 'system-ui, sans-serif',
  color: '#374151',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#9CA3AF',
  fontSize: '24px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

// ... other style objects (header, title, tabs, etc.) remain the same ...
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
};
const titleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
};
const accountIconStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#D1D5DB',
};
const tabContainerStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
};
const baseTabButtonStyle = {
  padding: '4px 12px',
  fontSize: '14px',
  borderRadius: '9999px',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s, color 0.2s',
};
const activeTabButtonStyle = {
  ...baseTabButtonStyle,
  backgroundColor: '#3B82F6',
  color: 'white',
};
const inactiveTabButtonStyle = {
  ...baseTabButtonStyle,
  backgroundColor: '#E5E7EB',
  color: '#4B5563',
};
const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
};

// --- Mock Data ---
const mockData = {
  // ... data remains the same
};

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    style={active ? activeTabButtonStyle : inactiveTabButtonStyle}
  >
    {children}
  </button>
);

function Leaderboard({ zoom, onClose }) { // Added onClose prop
  const [scope, setScope] = useState('country');
  const [time, setTime] = useState('day');

  const data = mockData[scope]?.[time] || [];
  const title = `${scope.charAt(0).toUpperCase() + scope.slice(1)} Leaderboard`;

  return (
    <div style={overlayStyle}>
      <div style={leaderboardStyle}>
        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <div style={accountIconStyle}></div>
        </div>

        <div style={tabContainerStyle}>
          <TabButton active={scope === 'country'} onClick={() => setScope('country')}>Country</TabButton>
          <TabButton active={scope === 'city'} onClick={() => setScope('city')}>City</TabButton>
          <TabButton active={scope === 'personal'} onClick={() => setScope('personal')}>Personal</TabButton>
        </div>

        <div style={tabContainerStyle}>
          <TabButton active={time === 'day'} onClick={() => setTime('day')}>Day</TabButton>
          <TabButton active={time === 'week'} onClick={() => setTime('week')}>Week</TabButton>
          <TabButton active={time === 'month'} onClick={() => setTime('month')}>Month</TabButton>
          <TabButton active={time === 'all'} onClick={() => setTime('all')}>All</TabButton>
        </div>

        <ul style={listStyle}>
          {data.map(item => (
            <li key={item.rank} style={listItemStyle}>
              <span style={{ fontWeight: 'bold', width: '24px' }}>{item.rank}</span>
              <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              <span style={{ fontWeight: '600', color: '#3B82F6' }}>{item.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Leaderboard;
