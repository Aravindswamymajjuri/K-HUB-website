import React, { useState, useEffect } from 'react';
import './internship.css';

const API_BASE_URL = 'http://localhost:5000/api/interships'; // Adjusted to backend port 5000

const App = () => {
  const [currentView, setCurrentView] = useState('batches'); // 'batches', 'internships', 'details'
  const [batches, setBatches] = useState([]);
  const [internships, setInternships] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  // Fetch all batches
  const fetchBatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/batches`);
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch batches');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch internships for a specific batch
  const fetchInternships = async (batchNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships`);
      const data = await response.json();
      
      if (data.success) {
        setInternships(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch internships');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific internship details
  const fetchInternshipDetails = async (batchNumber, internshipId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships/${internshipId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedInternship(data.data);
      } else {
        setError(data.message || 'Failed to fetch internship details');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching internship details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle batch selection
  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setCurrentView('internships');
    fetchInternships(batch.batchNumber);
  };

  // Handle internship selection
  const handleInternshipClick = (internship) => {
    setCurrentView('details');
    fetchInternshipDetails(selectedBatch.batchNumber, internship._id);
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentView === 'details') {
      setCurrentView('internships');
      setSelectedInternship(null);
    } else if (currentView === 'internships') {
      setCurrentView('batches');
      setSelectedBatch(null);
      setInternships([]);
    }
  };

  // Load batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  // Render loading spinner
  const renderLoading = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  // Render error message
  const renderError = () => (
    <div className="error-container">
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    </div>
  );

  // Render batch cards
  const renderBatches = () => (
    <div className="container">
      <header className="header">
        <h1>Internship Batches</h1>
        <p>Select a batch to view internships</p>
      </header>

      {batches.length === 0 ? (
        <div className="empty-state">
          <h3>No Batches Found</h3>
          <p>There are currently no internship batches available.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="batch-card"
              onClick={() => handleBatchClick(batch)}
            >
              <div className="card-header">
                <h3>Batch {batch.batchNumber}</h3>
                <span className="internship-count">
                  {batch.internships.length} internships
                </span>
              </div>
              <div className="card-content">
                <p className="created-date">
                  Created: {new Date(batch.createdAt).toLocaleDateString()}
                </p>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-number">{batch.internships.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {batch.internships.filter(i => i.image).length}
                    </span>
                    <span className="stat-label">With Images</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="view-link">View Internships →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );

  // Render internship cards
  const renderInternships = () => (
    <div className="container">
      <header className="header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Batches
        </button>
        <h1>Batch {selectedBatch.batchNumber} Internships</h1>
        <p>{internships.length} internships in this batch</p>
      </header>

      {internships.length === 0 ? (
        <div className="empty-state">
          <h3>No Internships Found</h3>
          <p>This batch doesn't have any internships yet.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {internships.map((internship) => (
            <div
              key={internship._id}
              className="internship-card"
              onClick={() => handleInternshipClick(internship)}
            >
              {internship.image && (
                <div className="card-image">
                  <img
                    src={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/internships/${internship._id}/image`}
                    alt={internship.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="card-content">
                <h3>{internship.name}</h3>
                <p className="roll-no">{internship.rollNo}</p>
                <h4 className="internship-title">{internship.internshipTitle}</h4>
                <p className="company">{internship.company}</p>
                <div className="duration-badge">
                  {internship.duration}
                </div>
              </div>
              <div className="card-footer">
                <span className="view-link">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render internship details
  const renderInternshipDetails = () => (
    <div className="container">
      <header className="header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Internships
        </button>
        <h1>Internship Details</h1>
      </header>

      {selectedInternship && (
        <div className="details-container">
          <div className="details-card">
            {selectedInternship.image && (
              <div className="details-image">
                <img
                  src={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/internships/${selectedInternship._id}/image`}
                  alt={selectedInternship.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="details-content">
              <div className="details-header">
                <h2>{selectedInternship.name}</h2>
                <span className="roll-badge">{selectedInternship.rollNo}</span>
              </div>
              
              <div className="details-info">
                <div className="info-section">
                  <h3>Internship Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Title:</label>
                      <span>{selectedInternship.internshipTitle}</span>
                    </div>
                    <div className="info-item">
                      <label>Company:</label>
                      <span>{selectedInternship.company}</span>
                    </div>
                    <div className="info-item">
                      <label>Duration:</label>
                      <span>{selectedInternship.duration}</span>
                    </div>
                    <div className="info-item">
                      <label>Batch:</label>
                      <span>Batch {selectedBatch.batchNumber}</span>
                    </div>
                  </div>
                </div>
                
                {selectedInternship.description && (
                  <div className="info-section">
                    <h3>Description</h3>
                    <p className="description">{selectedInternship.description}</p>
                  </div>
                )}
                
                <div className="info-section">
                  <h3>Timestamps</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Created:</label>
                      <span>{new Date(selectedInternship.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Updated:</label>
                      <span>{new Date(selectedInternship.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {selectedInternship.certificate && (
                  <div className="info-section">
                    <h3>Certificate</h3>
                    <a
                      href={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/internships/${selectedInternship._id}/certificate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certificate-link"
                    >
                      📄 Download Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="app">
      {error && renderError()}
      {loading && renderLoading()}
      {!error && !loading && (
        <>
          {currentView === 'batches' && renderBatches()}
          {currentView === 'internships' && renderInternships()}
          {currentView === 'details' && renderInternshipDetails()}
        </>
      )}
    </div>
  );
};

export default App;