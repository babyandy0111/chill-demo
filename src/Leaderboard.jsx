import React, { useState } from 'react';

// --- Style Objects ---
const overlayStyle = {
  position: 'fixed', inset: '0px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
};

const leaderboardStyle = {
  position: 'relative', width: '400px', height: '550px',
  backgroundColor: 'white', borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#374151',
  display: 'flex', flexDirection: 'column',
};

const closeButtonStyle = {
  position: 'absolute', top: '16px', right: '16px', color: '#9CA3AF',
  fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer',
};

const headerStyle = {
  paddingBottom: '12px', borderBottom: '1px solid #E5E7EB', marginBottom: '16px',
};

const titleStyle = { fontSize: '22px', fontWeight: 'bold' };

const tabContainerStyle = { display: 'flex', gap: '12px', marginBottom: '16px' };

const scopeTabStyle = (isActive) => ({
  padding: '6px 16px', fontSize: '16px', borderRadius: '8px', border: 'none',
  cursor: 'pointer', transition: 'all 0.2s',
  backgroundColor: isActive ? '#3B82F6' : 'transparent',
  color: isActive ? 'white' : '#4B5563',
});

const timeSegmentedControlStyle = {
  display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '4px',
};

const timeTabStyle = (isActive) => ({
  flex: 1, textAlign: 'center', padding: '6px', fontSize: '14px',
  borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
  backgroundColor: isActive ? 'white' : 'transparent',
  color: isActive ? '#1F2937' : '#6B7280',
  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
});

const listHeaderStyle = {
  display: 'flex', padding: '8px 16px', color: '#6B7280', fontSize: '12px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const listContainerStyle = { flexGrow: 1, overflowY: 'auto', paddingRight: '8px' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' };
const listItemStyle = {
  display: 'flex', alignItems: 'center', padding: '10px 16px',
  borderRadius: '8px', transition: 'background-color 0.2s',
};

// --- Expanded Mock Data ---
const mockData = {
  region: {
    day: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + i)}`, score: 9876 - i * 450 })),
    week: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + i)}`, score: 76543 - i * 2100 })),
    month: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + i)}`, score: 312345 - i * 11000 })),
    all: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + i)}`, score: 1567890 - i * 55000 })),
  },
  country: {
    day: [{ rank: 1, name: 'Taiwan', score: 5120 }, { rank: 2, name: 'Japan', score: 4900 }, { rank: 3, name: 'USA', score: 4850 }, { rank: 4, name: 'Germany', score: 4500 }, { rank: 5, name: 'South Korea', score: 4300 }, { rank: 6, name: 'UK', score: 4100 }, { rank: 7, name: 'Singapore', score: 3900 }],
    week: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + i)}`, score: 40120 - i * 1500 })),
    month: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + i)}`, score: 150120 - i * 5000 })),
    all: Array.from({ length: 15 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + i)}`, score: 750120 - i * 25000 })),
  },
  passion: {
    day: [{ rank: 1, name: 'Music', score: 980 }, { rank: 2, name: 'Gaming', score: 950 }, { rank: 3, name: 'Art & Design', score: 850 }, { rank: 4, name: 'Sports', score: 820 }, { rank: 5, name: 'Photography', score: 780 }],
    week: Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 8500 - i * 400 })),
    month: Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 32000 - i * 1500 })),
    all: Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 150000 - i * 7000 })),
  },
  group: {
    day: [{ rank: 1, name: 'Cloud Chasers', score: 1200 }, { rank: 2, name: 'Chill Masters', score: 1150 }, { rank: 3, name: 'Sky High Club', score: 1050 }],
    week: Array.from({ length: 8 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 9800 - i * 500 })),
    month: Array.from({ length: 8 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 41000 - i * 2000 })),
    all: Array.from({ length: 8 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 215000 - i * 10000 })),
  }
};

function Leaderboard({ onClose }) {
  const [scope, setScope] = useState('region');
  const [time, setTime] = useState('day');
  const [hoveredRank, setHoveredRank] = useState(null);

  const data = mockData[scope]?.[time] || [];

  return (
    <div style={overlayStyle}>
      <div style={leaderboardStyle}>
        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Leaderboard</h3>
        </div>

        <div style={tabContainerStyle}>
          {['region', 'country', 'passion', 'group'].map(s => (
            <button key={s} onClick={() => setScope(s)} style={scopeTabStyle(scope === s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div style={timeSegmentedControlStyle}>
          {['day', 'week', 'month', 'all'].map(t => (
            <button key={t} onClick={() => setTime(t)} style={timeTabStyle(time === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={listHeaderStyle}>
          <span style={{ width: '50px' }}>Rank</span>
          <span style={{ flexGrow: 1 }}>Name</span>
          <span style={{ width: '80px', textAlign: 'right' }}>Score</span>
        </div>

        <div style={listContainerStyle}>
          <ul style={listStyle}>
            {data.map(item => (
              <li 
                key={item.rank} 
                style={{...listItemStyle, backgroundColor: hoveredRank === item.rank ? '#F9FAFB' : 'transparent'}}
                onMouseEnter={() => setHoveredRank(item.rank)}
                onMouseLeave={() => setHoveredRank(null)}
              >
                <span style={{ width: '50px', fontWeight: '600', color: '#6B7280' }}>{item.rank}</span>
                <span style={{ flexGrow: 1, fontWeight: '500' }}>{item.name}</span>
                <span style={{ width: '80px', textAlign: 'right', fontWeight: 'bold', color: '#3B82F6' }}>{item.score.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
