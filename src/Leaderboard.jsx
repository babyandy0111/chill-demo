// src/Leaderboard.jsx
import React from 'react';

const leaderboardStyle = {
    position: 'absolute',
    top: '80px',
    left: '20px',
    width: '250px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 20,
    padding: '15px',
    fontFamily: 'Arial, sans-serif',
};

const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
    textAlign: 'center',
};

const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
};

const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
};

const rankStyle = {
    fontWeight: 'bold',
    marginRight: '10px',
    color: '#333',
};

const nameStyle = {
    flexGrow: 1,
    color: '#555',
};

const scoreStyle = {
    fontWeight: 'bold',
    color: '#46bcec',
};

// 假資料
const worldData = [
    { rank: 1, name: '東京', score: 1024 },
    { rank: 2, name: '紐約', score: 980 },
    { rank: 3, name: '倫敦', score: 850 },
    { rank: 4, name: '巴黎', score: 760 },
    { rank: 5, name: '台北', score: 680 },
];

const countryData = {
    '台灣': [
        { rank: 1, name: '台北', score: 680 },
        { rank: 2, name: '高雄', score: 540 },
        { rank: 3, name: '台中', score: 480 },
        { rank: 4, name: '台南', score: 420 },
        { rank: 5, name: '新竹', score: 350 },
    ],
    '日本': [
        { rank: 1, name: '東京', score: 1024 },
        { rank: 2, name: '大阪', score: 880 },
        { rank: 3, name: '京都', score: 720 },
        { rank: 4, name: '福岡', score: 610 },
        { rank: 5, name: '札幌', score: 550 },
    ]
};

const localData = {
    '台北': {
        total: 680,
        today: 52,
    }
};


function Leaderboard({ zoom, currentCity = '台北', currentCountry = '台灣' }) {
    let title = '';
    let data = [];

    if (zoom <= 5) {
        title = '全球 Chill 指數 Top 5';
        data = worldData;
    } else if (zoom <= 10) {
        title = `${currentCountry} Chill 指數 Top 5`;
        data = countryData[currentCountry] || [];
    } else {
        const cityData = localData[currentCity];
        return (
            <div style={leaderboardStyle}>
                <h3 style={titleStyle}>{currentCity} Chill 指數</h3>
                <div style={{textAlign: 'center', padding: '10px'}}>
                    <div style={{fontSize: '28px', fontWeight: 'bold', color: '#46bcec'}}>{cityData?.total || 0}</div>
                    <div style={{fontSize: '14px', color: '#777'}}>總累積</div>
                </div>
                 <div style={{textAlign: 'center', padding: '10px', marginTop: '10px'}}>
                    <div style={{fontSize: '22px', fontWeight: 'bold', color: '#555'}}>{cityData?.today || 0}</div>
                    <div style={{fontSize: '12px', color: '#999'}}>今日貢獻</div>
                </div>
            </div>
        );
    }

    return (
        <div style={leaderboardStyle}>
            <h3 style={titleStyle}>{title}</h3>
            <ul style={listStyle}>
                {data.map(item => (
                    <li key={item.rank} style={listItemStyle}>
                        <span style={rankStyle}>{item.rank}</span>
                        <span style={nameStyle}>{item.name}</span>
                        <span style={scoreStyle}>{item.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Leaderboard;
