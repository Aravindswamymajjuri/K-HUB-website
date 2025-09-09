import React from 'react';
import './LogoLoader.css';

const LogoLoader = () => {
  return (
    <div className="logo-loader-container">
      <img
        src="/ChatGPT Image Aug 4, 2025, 09_25_59 AM (1).png"
        alt="KIET HUB Logo"
        className="logo-static"
      />
      <div className="dot-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default LogoLoader;
