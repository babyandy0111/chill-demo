import React, { memo } from 'react';
import { playClickSound } from '../audioPlayer.js';
import { useAppStore } from '../store.js';

const styles = {
  container: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    padding: '20px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontFamily: 'system-ui, sans-serif',
    color: '#222',
    zIndex: 100,
    minWidth: '320px',
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  },
  flag: {
    width: '40px',
    height: 'auto',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: 1,
  },
  locationText: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  coordsText: {
    fontSize: '14px',
    color: '#666',
  },
  claimButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  loadingText: {
    fontSize: '16px',
    color: '#555',
  }
};

const CellInfoWindow = ({ cellInfo }) => {
  const claimSelectedCell = useAppStore((state) => state.claimSelectedCell);

  if (!cellInfo) return null;

  const [iy, ix] = cellInfo.key.split('_');

  const handleClaimClick = () => {
    playClickSound();
    // Directly call the action from the store.
    // The App component will handle opening the modal if needed.
    claimSelectedCell();
  };

  const handleMouseDown = (e) => {
    e.target.style.transform = 'scale(0.95)';
  };
  const handleMouseUp = (e) => {
    e.target.style.transform = 'scale(1)';
  };

  return (
    <div style={styles.container}>
      {cellInfo.isLoading ? (
        <div style={styles.loadingText}>正在取得地點資訊...</div>
      ) : (
        <>
          {cellInfo.flagUrl && <img src={cellInfo.flagUrl} alt="Country Flag" style={styles.flag} />}
          <div style={styles.infoContainer}>
            <div style={styles.locationText}>
              {cellInfo.countryName}{cellInfo.regionName && `, ${cellInfo.regionName}`}
            </div>
            <div style={styles.coordsText}>
              座標 (X: {ix}, Y: {iy})
            </div>
          </div>
          <button
            style={styles.claimButton}
            onClick={handleClaimClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            佔領
          </button>
        </>
      )}
    </div>
  );
};

export default memo(CellInfoWindow);
