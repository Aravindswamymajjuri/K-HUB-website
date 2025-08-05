import React from 'react';
import AboutUs from './abouthub';  
import Support from './support';
import Counts from './counts';  
import './home.css';
import Slides from '../slides/slides';
import SlideShow from './SlideShow';


const Home = () => {
  

  return (
    <div className="home">
     
      <AboutUs />
    <SlideShow />
      <Support />
      <Counts/>
    </div>
  );
};

export default Home;
