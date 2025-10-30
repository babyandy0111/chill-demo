import React, { memo } from 'react';

const styles = {
  overlay: {
    position: 'fixed', inset: '0px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    width: 'calc(100% - 2rem)', maxWidth: '500px',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    padding: '24px 32px', position: 'relative',
  },
  closeButton: {
    position: 'absolute', top: '16px', right: '16px',
    color: '#9CA3AF', fontSize: '28px',
    background: 'none', border: 'none', cursor: 'pointer',
  },
  header: {
    paddingBottom: '12px', borderBottom: '1px solid #E5E7EB',
    marginBottom: '20px', textAlign: 'center',
  },
  title: {
    fontSize: '24px', fontWeight: 'bold', color: '#1F2937',
  },
  content: {
    overflowY: 'auto',
    lineHeight: '1.6',
    color: '#4B5563',
  },
  sectionTitle: {
    fontSize: '18px', fontWeight: '600',
    color: '#111827', marginTop: '20px', marginBottom: '8px',
  },
  stepList: {
    paddingLeft: '20px',
    listStyle: 'decimal',
  },
  strong: {
    color: '#3B82F6',
    fontWeight: '600',
  }
};

function InfoModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>
          &times;
        </button>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome to Chill Map</h2>
        </div>
        <div style={styles.content}>
          <p>
            This is a collaborative space to share and discover "chill" spots around the world. 
            A chill spot can be anything from a quiet park bench with a great view to a cozy coffee shop.
          </p>

          <h3 style={styles.sectionTitle}>How to Play</h3>
          <ol style={styles.stepList}>
            <li>You start with <strong style={styles.strong}>10</strong> clouds.</li>
            <li>Explore the map and find a spot you consider "chill".</li>
            <li>Click on the map to place a cloud, sharing your chill moment with the world.</li>
            <li>Each click uses one cloud. Run out? Register to get <strong style={styles.strong}>+10</strong> more!</li>
          </ol>

          <h3 style={styles.sectionTitle}>Features</h3>
          <ul style={styles.stepList}>
            <li><strong style={styles.strong}>Leaderboards (🏆):</strong> See who are the top contributors by region, country, and more.</li>
            <li><strong style={styles.strong}>Compass (🧭):</strong> Click to fly to your current location.</li>
            <li><strong style={styles.strong}>Zoom (+/-):</strong> Use the buttons or your scroll wheel to explore.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
