import React, { useState, memo } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // Import default styles

const styles = {
  overlay: {
    position: 'fixed', inset: '0px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  leaderboard: {
    position: 'relative', width: '500px', height: '550px',
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
  listContainer: {
    flexGrow: 1, height: '100%',
    overflowY: 'scroll', // Ensure it's scrollable
    /* Hide scrollbar for Chrome, Safari and Opera */
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    /* Hide scrollbar for IE, Edge and Firefox */
    msOverflowStyle: 'none',  /* IE and Edge */
    scrollbarWidth: 'none',  /* Firefox */
  },
  listItem: {
    display: 'flex', alignItems: 'center', padding: '10px 16px',
    justifyContent: 'space-between', // Distribute space evenly
  },
  rank: { width: '50px', fontWeight: '600', color: '#6B7280' },
  name: { flexGrow: 1, fontWeight: '500', marginRight: '10px' }, // Add a small margin to separate from score
  score: { width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#3B82F6', flexShrink: 0 }, // Prevent shrinking
};

const mockData = {
  region: {
    day: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + (i % 26))}${i}`, score: 9876 - i * 45 })),
    week: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + (i % 26))}${i}`, score: 76543 - i * 210 })),
    month: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + (i % 26))}${i}`, score: 312345 - i * 1100 })),
    all: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Region ${String.fromCharCode(65 + (i % 26))}${i}`, score: 1567890 - i * 5500 })),
  },
  country: {
    day: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + (i % 26))}${i}`, score: 5120 - i * 5 })),
    week: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + (i % 26))}${i}`, score: 40120 - i * 150 })),
    month: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + (i % 26))}${i}`, score: 150120 - i * 500 })),
    all: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Country ${String.fromCharCode(65 + (i % 26))}${i}`, score: 750120 - i * 2500 })),
  },
  passion: {
    day: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 980 - i * 1 })),
    week: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 8500 - i * 40 })),
    month: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 32000 - i * 150 })),
    all: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Passion #${i + 1}`, score: 150000 - i * 700 })),
  },
  group: {
    day: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 1200 - i * 1 })),
    week: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 9800 - i * 50 })),
    month: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 41000 - i * 200 })),
    all: Array.from({ length: 1000 }, (_, i) => ({ rank: i + 1, name: `Group #${i + 1}`, score: 215000 - i * 1000 })),
  }
};

function Leaderboard({ onClose }) {
  const [scope, setScope] = useState('region');
  const [time, setTime] = useState('day');

  const data = mockData[scope]?.[time] || [];

  const rowRenderer = ({ index, key, style }) => {
    const item = data[index];
    return (
      <div key={key} style={{ ...style, ...styles.listItem, width: '95%' }}>
        <span style={styles.rank}>{item.rank}</span>
        <span style={styles.name}>{item.name}</span>
        <span style={styles.score}>{item.score.toLocaleString()}</span>
      </div>
    );
  };

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
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={data.length}
                rowHeight={45}
                rowRenderer={rowRenderer}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
