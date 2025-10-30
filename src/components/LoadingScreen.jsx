import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <h1 className="loading-title">正在進入 Chill 空間...</h1>
            <div className="progress-bar-container">
                <div className="progress-bar"></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
