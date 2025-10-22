import React from 'react';

function RegistrationModal({ onRegister, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl text-center w-11/12 max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-3 text-gray-800">註冊以獲得更多 Chill！</h2>
        <p className="text-gray-600 mb-6">
          您的 10 朵雲已經用完了！<br />
          註冊即可獲得額外 <strong className="text-blue-500">+10</strong> 朵雲，繼續分享您的 Chill！
        </p>
        <input
          type="email"
          placeholder="請輸入您的 Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={onRegister}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors"
        >
          註冊並領取獎勵
        </button>
      </div>
    </div>
  );
}

export default RegistrationModal;
