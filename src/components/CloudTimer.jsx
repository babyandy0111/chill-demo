import React, { useState, useEffect, memo } from 'react';
import { useAppStore } from '../store.js';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '10px 16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
  },
  icon: {
    fontSize: '22px',
  },
  timer: {
    minWidth: '35px', // Adjust minWidth for larger font
    textAlign: 'center',
    fontSize: '18px',
  },
};

const CloudTimer = () => {
  const clouds = useAppStore((state) => state.clouds);
  const lastCloudIncrease = useAppStore((state) => state.lastCloudIncrease);
  const increaseCloud = useAppStore((state) => state.increaseCloud);

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timerInterval;

    if (clouds < 10) {
      timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastCloudIncrease;
        const remaining = 60000 - elapsed; // 60 seconds in ms

        if (remaining <= 0) {
          increaseCloud();
          setTimeLeft(60); // Reset timer after increasing cloud
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }, 1000);
    } else {
      clearInterval(timerInterval); // Clear interval if clouds are full
      setTimeLeft(0); // No timer if clouds are full
    }

    return () => clearInterval(timerInterval);
  }, [clouds, lastCloudIncrease, increaseCloud]);

  return (
    <div style={styles.container}>
      <span style={styles.icon}>☁️</span>
      {clouds < 10 ? (
        <span style={styles.timer}>{timeLeft}s</span>
      ) : (
        <span style={styles.timer}>⏰</span>
      )}
    </div>
  );
};

export default memo(CloudTimer);
