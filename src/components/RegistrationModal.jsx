import React, { memo } from 'react';

const styles = {
  overlay: {
    position: 'fixed', inset: '0px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  modal: {
    backgroundColor: 'white', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    textAlign: 'center', width: 'calc(100% - 2rem)',
    maxWidth: '400px', padding: '32px', position: 'relative',
  },
  closeButton: {
    position: 'absolute', top: '16px', right: '16px',
    color: '#9CA3AF', fontSize: '24px',
    background: 'none', border: 'none', cursor: 'pointer',
  },
  title: {
    fontSize: '24px', fontWeight: 'bold',
    marginBottom: '12px', color: '#1F2937',
  },
  text: {
    color: '#4B5563', marginBottom: '24px', lineHeight: '1.5',
  },
  strong: {
    color: '#3B82F6',
  },
  input: {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '16px',
  },
  registerButton: {
    width: '100%', padding: '12px', backgroundColor: '#3B82F6',
    color: 'white', borderRadius: '8px', fontWeight: 'bold',
    fontSize: '18px', border: 'none', cursor: 'pointer',
  },
};

function RegistrationModal({ onRegister, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          &times;
        </button>
        <h2 style={styles.title}>註冊以獲得更多 Chill！</h2>
        <p style={styles.text}>
          您的 10 朵雲已經用完了！<br />
          註冊即可獲得額外 <strong style={styles.strong}>+10</strong> 朵雲，繼續分享您的 Chill！
        </p>
        <input
          type="email"
          placeholder="請輸入您的 Email"
          style={styles.input}
        />
        <button
          onClick={onRegister}
          style={styles.registerButton}
        >
          註冊並領取獎勵
        </button>
      </div>
    </div>
  );
}

export default RegistrationModal;
