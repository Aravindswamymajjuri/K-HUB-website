import React from 'react';
import './landpage.css';
import Home from './home1'; // Make sure this path is correct

const generateDots = (count) => {
  return Array.from({ length: count }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${10 + Math.random() * 20}s`,
      opacity: Math.random(),
      width: `${3 + Math.random() * 4}px`,
      height: `${3 + Math.random() * 4}px`
    };
    return <div key={i} className="floating-dot" style={style} />;
  });
};

const LandingPage = () => {
  return (
    <>
      <div className="landing-page">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="floating-dots">{generateDots(50)}</div>

        <div className="left-container">
          <div className="intro-text">
            <h1>
              Welcome to <span className="highlight">The KHUB</span>
            </h1>
            <p className="subtitle">
              Your Gateway to Innovation and Collaboration.
            </p>
          </div>
        </div>

        <div className="right-container">
          <img src="khub_logo.png" alt="Innovation Bulb" className="logo" />
        </div>
      </div>

      {/* Home component rendered below landing-page */}
      <Home />
    </>
  );
};

export default LandingPage;
