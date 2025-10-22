import React, { useState } from 'react';

// Mock Data (can be replaced with API calls)
const mockData = {
  country: {
    day: [{ rank: 1, name: '台灣', score: 1024 }, { rank: 2, name: '日本', score: 980 }],
    week: [{ rank: 1, name: '日本', score: 8024 }, { rank: 2, name: '美國', score: 7980 }],
    month: [{ rank: 1, name: '美國', score: 30024 }, { rank: 2, name: '台灣', score: 28980 }],
    all: [{ rank: 1, name: '美國', score: 150024 }, { rank: 2, name: '日本', score: 128980 }],
  },
  city: {
    day: [{ rank: 1, name: '台北', score: 512 }, { rank: 2, name: '東京', score: 490 }],
    week: [{ rank: 1, name: '東京', score: 4012 }, { rank: 2, name: '紐約', score: 3990 }],
    month: [{ rank: 1, name: '紐約', score: 15012 }, { rank: 2, name: '台北', score: 14490 }],
    all: [{ rank: 1, name: '紐約', score: 75012 }, { rank: 2, name: '東京', score: 64490 }],
  },
  personal: {
    day: [{ rank: 1, name: 'User A', score: 50 }, { rank: 2, name: 'User B', score: 45 }],
    week: [{ rank: 1, name: 'User C', score: 250 }, { rank: 2, name: 'User A', score: 245 }],
    month: [{ rank: 1, name: 'User C', score: 1000 }, { rank: 2, name: 'User D', score: 950 }],
    all: [{ rank: 1, name: 'User C', score: 5000 }, { rank: 2, name: 'User D', score: 4750 }],
  }
};

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm rounded-full transition-colors ${
      active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`}
  >
    {children}
  </button>
);

function Leaderboard() {
  const [scope, setScope] = useState('country'); // country, city, personal
  const [time, setTime] = useState('day'); // day, week, month, all

  const data = mockData[scope][time];
  const title = `${scope.charAt(0).toUpperCase() + scope.slice(1)} Leaderboard`;

  return (
    <div className="w-64 bg-white bg-opacity-90 rounded-xl shadow-lg p-4 text-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">{title}</h3>
        {/* Account Icon Placeholder */}
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
      </div>

      {/* Scope Tabs */}
      <div className="flex space-x-2 mb-3">
        <TabButton active={scope === 'country'} onClick={() => setScope('country')}>Country</TabButton>
        <TabButton active={scope === 'city'} onClick={() => setScope('city')}>City</TabButton>
        <TabButton active={scope === 'personal'} onClick={() => setScope('personal')}>Personal</TabButton>
      </div>

      {/* Time Tabs */}
      <div className="flex space-x-2 mb-4">
        <TabButton active={time === 'day'} onClick={() => setTime('day')}>Day</TabButton>
        <TabButton active={time === 'week'} onClick={() => setTime('week')}>Week</TabButton>
        <TabButton active={time === 'month'} onClick={() => setTime('month')}>Month</TabButton>
        <TabButton active={time === 'all'} onClick={() => setTime('all')}>All</TabButton>
      </div>

      {/* Leaderboard List */}
      <ul className="space-y-2">
        {data.map(item => (
          <li key={item.rank} className="flex items-center text-sm">
            <span className="font-bold w-6">{item.rank}</span>
            <span className="flex-grow truncate">{item.name}</span>
            <span className="font-semibold text-blue-500">{item.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
