import React from 'react';

function Compass({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Reset View"
      className="w-12 h-12 bg-white bg-opacity-90 rounded-full shadow-lg flex justify-center items-center cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110"
    >
      <span className="text-3xl">🧭</span>
    </button>
  );
}

export default Compass;
