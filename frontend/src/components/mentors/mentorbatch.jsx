import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './mentorbatch.css';
import LogoLoader from '../achivements/LogoLoader'; // Import LogoLoader

const MentorBatch = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  if (loading) {
    return (
      <div className="mentor-batch-wrapper">
        <div className="mentor-batch-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <h2>Mentor Batches</h2>
          <LogoLoader />
        </div>
        <footer className="footer">
          <p>© 2025 Your Website</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="mentor-batch-wrapper">
      <div className="mentor-batch-container">
        <h2>Mentor Batches</h2>
        <div className="mentor-batch-grid">
          {batches.map((batch, index) => (
            <Link
              key={index}
              to={`/mentors/${batch.batchNumber}`}
              className="mentor-batch-link"
            >
              <div className="mentor-batch-card">
                <h3>Batch {batch.batchNumber}</h3>
                <p>Click to view mentors</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <footer className="footer">
        <p>© 2025 Your Website</p>
      </footer>
    </div>
  );
};

export default MentorBatch;
