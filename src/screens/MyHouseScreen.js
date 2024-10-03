import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './HouseTabz.css';

const HouseTabz = () => {
  return (
    <div className="container">
      <header className="header">
        <h1 className="app-name">HouseTabz</h1>
        <div className="header-icons">
          <span role="img" aria-label="notification" className="icon">🔔</span>
          <span role="img" aria-label="profile" className="icon">👤</span>
        </div>
      </header>

      <div className="house-status-container">
        <div className="progress-bar-container">
          <CircularProgressbar 
            value={70} 
            text={`HSI`} 
            styles={buildStyles({
              textSize: '16px',
              pathColor: '#77dd77',
              textColor: '#77dd77',
              trailColor: '#f5f5f5',
            })}
          />
        </div>
        <div className="house-status">House Status: Great</div>
      </div>

      <div className="score-board-container">
        <h2 className="section-title">Score Board</h2>
        <div className="score-board"></div>
      </div>

      <div className="current-tab-container">
        <h2 className="section-title">CurrentTab</h2>
        <div className="tab"></div>
      </div>

      <div className="paid-tabz-container">
        <h2 className="section-title">PaidTabz</h2>
        <div className="tab"></div>
      </div>
    </div>
  );
}

export default HouseTabz;
