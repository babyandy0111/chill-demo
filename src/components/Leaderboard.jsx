import React, { useState, memo } from 'react';

const styles = {
  overlay: {
    position: 'fixed', inset: '0px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  leaderboard: {
    position: 'relative', width: '400px', height: '550px',
    backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#374151',
    display: 'flex', flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute', top: '16px', right: '16px', color: '#9CA3AF',
    fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer',
  },
  header: {
    paddingBottom: '12px', borderBottom: '1px solid #E5E7EB', marginBottom: '16px',
  },
  title: { fontSize: '22px', fontWeight: 'bold' },
  tabContainer: { display: 'flex', gap: '12px', marginBottom: '16px' },
  scopeTab: (isActive) => ({
    padding: '6px 16px', fontSize: '16px', borderRadius: '8px', border: 'none',
    cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: isActive ? '#3B82F6' : 'transparent',
    color: isActive ? 'white' : '#4B5563',
  }),
  timeSegmentedControl: {
    display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '4px',
  },
  timeTab: (isActive) => ({
    flex: 1, textAlign: 'center', padding: '6px', fontSize: '14px',
    borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: isActive ? 'white' : 'transparent',
    color: isActive ? '#1F2937' : '#6B7280',
    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  }),
  listHeader: {
    display: 'flex', padding: '8px 16px', color: '#6B7280', fontSize: '12px',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  listContainer: { flexGrow: 1, overflowY: 'auto', paddingRight: '8px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' },
  listItem: (isHovered) => ({
    display: 'flex', alignItems: 'center', padding: '10px 16px',
    borderRadius: '8px', transition: 'background-color 0.2s',
    backgroundColor: isHovered ? '#F9FAFB' : 'transparent',
  }),
  rank: { width: '50px', fontWeight: '600', color: '#6B7280' },
  name: { flexGrow: 1, fontWeight: '500' },
  score: { width: '80px', textAlign: 'right', fontWeight: 'bold', color: '#3B82F6' },
};

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
    <div style={styles.overlay}>
      <div style={styles.leaderboard}>
        <button onClick={onClose} style={styles.closeButton}>&times;</button>
        <div style={styles.header}>
          <h3 style={styles.title}>Leaderboard</h3>
        </div>

        <div style={styles.tabContainer}>
          {['region', 'country', 'passion', 'group'].map(s => (
            <button key={s} onClick={() => setScope(s)} style={styles.scopeTab(scope === s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div style={styles.timeSegmentedControl}>
          {['day', 'week', 'month', 'all'].map(t => (
            <button key={t} onClick={() => setTime(t)} style={styles.timeTab(time === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={styles.listHeader}>
          <span style={styles.rank}>Rank</span>
          <span style={styles.name}>Name</span>
          <span style={styles.score}>Score</span>
        </div>

        <div style={styles.listContainer}>
          <ul style={styles.list}>
            {data.map(item => (
              <li 
                key={item.rank} 
                style={styles.listItem(hoveredRank === item.rank)}
                onMouseEnter={() => setHoveredRank(item.rank)}
                onMouseLeave={() => setHoveredRank(null)}
              >
                <span style={styles.rank}>{item.rank}</span>
                <span style={styles.name}>{item.name}</span>
                <span style={styles.score}>{item.score.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
