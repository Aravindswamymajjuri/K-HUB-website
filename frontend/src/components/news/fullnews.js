import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './fullnews.css';

const FullNewsletter = () => {
  const [newsletter, setNewsletter] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch newsletter data
  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/news/${id}`);
        setNewsletter(response.data);
      } catch (error) {
        console.error('Error fetching newsletter:', error);
      }
    };

    fetchNewsletter();
  }, [id]);

  if (!newsletter) {
    return <div>Loading...</div>;
  }

  const onBack = () => {
    navigate('/news');
  };

  const pdfUrl = `http://localhost:5000/api/news/${id}/pdf`;

  // Called when user clicks "View PDF"
  const onViewPdf = async () => {
    try {
      const response = await axios.get(pdfUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert('Failed to load PDF');
    }
  };

  // Close modal and clean up blob URL
  const onCloseModal = () => {
    setShowPdfModal(false);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };

  return (
    <div className="bodyy">
      <div className="full-news">
        <button onClick={onBack} className="back-button">Back</button>
        <h2 className="newsletter-main-title">Newsletter</h2>

        {newsletter.pdf && newsletter.pdf.data && (
          <button onClick={onViewPdf} className="pdf-button">
            View / Download PDF
          </button>
        )}

        <div className="newsletter-content">
          {newsletter.items.map((item, index) => (
            <div key={index} className="newsletter-card">
              {item.type === 'image' ? (
                <img src={item.value} alt="Newsletter content" className="newsletter-image" />
              ) : item.type === 'title' ? (
                <h3 className="newsletter-title">{item.value}</h3>
              ) : item.type === 'subtitle' ? (
                <h4 className="newsletter-subtitle">{item.value}</h4>
              ) : (
                <p className="newsletter-text">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {showPdfModal && (
          <div className="pdf-modal-overlay" onClick={onCloseModal}>
            <div className="pdf-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close-button" onClick={onCloseModal}>
                &times;
              </button>

              {pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  title="Newsletter PDF"
                  className="pdf-iframe"
                  frameBorder="0"
                />
              ) : (
                <p>Loading PDF...</p>
              )}

              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  download={newsletter.pdf?.fileName || 'newsletter.pdf'}
                  className="modal-download-button"
                >
                  Download PDF
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullNewsletter;
