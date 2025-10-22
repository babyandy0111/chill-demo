import React from 'react';

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

const modalStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  width: 'calc(100% - 2rem)',
  maxWidth: '400px',
  padding: '32px',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  color: '#9CA3AF',
  fontSize: '24px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '12px',
  color: '#1F2937',
};

const textStyle = {
  color: '#4B5563',
  marginBottom: '24px',
  lineHeight: '1.5',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '16px',
};

const registerButtonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#3B82F6',
  color: 'white',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '18px',
  border: 'none',
  cursor: 'pointer',
};

function RegistrationModal({ onRegister, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          &times;
        </button>
        <h2 style={titleStyle}>註冊以獲得更多 Chill！</h2>
        <p style={textStyle}>
          您的 10 朵雲已經用完了！<br />
          註冊即可獲得額外 <strong style={{ color: '#3B82F6' }}>+10</strong> 朵雲，繼續分享您的 Chill！
        </p>
        <input
          type="email"
          placeholder="請輸入您的 Email"
          style={inputStyle}
        />
        <button
          onClick={onRegister}
          style={registerButtonStyle}
        >
          註冊並領取獎勵
        </button>
      </div>
    </div>
  );
}

export default RegistrationModal;
