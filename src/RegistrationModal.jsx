// src/RegistrationModal.jsx
import React from 'react';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // 確保在最上層
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px 40px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
};

const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
};

const textStyle = {
    fontSize: '16px',
    marginBottom: '25px',
    color: '#555',
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#46bcec',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};

function RegistrationModal({ onRegister }) {
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={titleStyle}>註冊以獲得更多 Chill！</h2>
                <p style={textStyle}>
                    您的 10 朵雲已經用完了！<br/>
                    註冊即可獲得額外 <strong>+10</strong> 朵雲，繼續分享您的 Chill！
                </p>
                <input
                    type="email"
                    placeholder="請輸入您的 Email"
                    style={inputStyle}
                />
                <button
                    style={buttonStyle}
                    onClick={onRegister}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#35a8d8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#46bcec'}
                >
                    註冊並領取獎勵
                </button>
            </div>
        </div>
    );
}

export default RegistrationModal;
