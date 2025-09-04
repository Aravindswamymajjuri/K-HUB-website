import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './fullevent.css';

const FullEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleImageClick = (images, index) => {
    setPreviewImage(images);
    setCurrentImageIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? previewImage.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === previewImage.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!event) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="full-event-page">
      <header className="event-header">
        <Link to="/events" className="back-button">
          &larr; Back to Events
        </Link>
      </header>
      
      <h1 className="event-title">{event.name}</h1>

      <div className="main-content">
        <img
          src={`data:image/jpeg;base64,${arrayBufferToBase64(event.mainPic.data)}`}
          alt="Main Event"
          className="cover-image"
        />

        <section className="sub-events-section">
          <h2 className="section-title">Sub-events</h2>
          {event.subEvents.map((subEvent, index) => (
            <div key={index} className="sub-event-card">
              <h3 className="sub-event-title">{subEvent.name}</h3>
              <p className="sub-event-description">{subEvent.description}</p>
              <div className="sub-event-images-grid">
                {subEvent.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={`data:image/jpeg;base64,${arrayBufferToBase64(image.data)}`}
                    alt={`Sub-event ${index} Image ${imgIndex}`}
                    onClick={() => handleImageClick(subEvent.images, imgIndex)}
                    className="sub-event-image"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {previewImage && (
        <div className="image-preview-modal">
          <button className="close-preview" onClick={handleClosePreview}>
            &times;
          </button>
          <button className="nav-button prev" onClick={handlePrevImage}>
            &lt;
          </button>
          <img
            src={`data:image/jpeg;base64,${arrayBufferToBase64(previewImage[currentImageIndex].data)}`}
            alt="Preview"
            className="preview-image-display"
          />
          <button className="nav-button next" onClick={handleNextImage}>
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default FullEvent;