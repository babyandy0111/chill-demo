import React from 'react';

function CloudCounter({ count }) {
  return (
    <div className="bg-black bg-opacity-70 text-white py-2 px-5 rounded-full shadow-lg flex items-center gap-3 text-lg">
      <span className="text-2xl">☁️</span>
      <span>{count}</span>
    </div>
  );
}

export default CloudCounter;
