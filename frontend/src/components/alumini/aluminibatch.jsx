import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './aluminibatch.css';
import LogoLoader from '../achivements/LogoLoader';

const BatchView = () => {
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
      <div className="batch-wrapper">
        <div className="custom-batch-container">
          <h2 className="heading">Batches</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <LogoLoader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-wrapper">
      <div className="custom-batch-container">
        <h2 className="heading">Batches</h2>
        <div className="custom-batch-grid">
          {batches.map((batch, index) => (
            <Link key={index} to={`/alumni/${batch.batchNumber}`} className="custom-batch-link">
              <div className="custom-batch-card">
                <h3>Batch {batch.batchNumber}</h3>
                <p><strong>Number of Teams:</strong> {batch.teams.length}</p>
                <p>Click to view alumni</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchView;
