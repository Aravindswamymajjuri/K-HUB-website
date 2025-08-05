import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "./SlideShow.css"; // Import your provided CSS

function SlideShow() {
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    axios.get("/api/achievements")
      .then(res => setAchievements(res.data))
      .catch(() => setAchievements([]));
    axios.get("/api/newss")
      .then(res => setNews(res.data))
      .catch(() => setNews([]));
    axios.get("/api/posters")
      .then(res => setPosters(res.data))
      .catch(() => setPosters([]));
  }, []);

  const slides = [
    ...achievements.map(a => ({ type: "achievement", ...a })),
    ...news.map(n => ({ type: "news", ...n })),
    ...posters.map(p => ({ type: "poster", ...p })),
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  function renderAchievement(a) {
    return (
      <div className="slide-content" key={a._id}>
        <h2>Achievement</h2>
        <img src={a.image} alt={a.name} />
        <h3>{a.name}</h3>
      </div>
    );
  }

  function renderNews(n) {
    return (
      <div className="slide-content" key={n._id}>
        {n.title && <h2>{n.title}</h2>}
        {n.subtitle && <h4>{n.subtitle}</h4>}
        {n.image && <img src={n.image} alt={n.title} />}
        {n.matter && <p>{n.matter}</p>}
      </div>
    );
  }

  function renderPoster(p) {
    const img = p.poster || p.image;
    return (
      <div className="slide-content" key={p._id}>
        <h2>Poster</h2>
        <img src={img} alt="Poster" />
      </div>
    );
  }

  if (slides.length === 0) {
    return <div>Loading slides...</div>;
  }

  return (
    <div>
      <Slider {...settings}>
        {slides.map((slide) => {
          if (slide.type === "achievement") return renderAchievement(slide);
          if (slide.type === "news") return renderNews(slide);
          if (slide.type === "poster") return renderPoster(slide);
          return null;
        })}
      </Slider>
    </div>
  );
}

export default SlideShow;
