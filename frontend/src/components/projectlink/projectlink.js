import React, { useState, useEffect } from 'react';
import { Eye, ExternalLink, Github, ArrowLeft, Users } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import './projectlink.css';

const API_BASE_URL = 'http://localhost:5000/api/projects';

const ProjectShowcase = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { batchNumber, teamNumber } = useParams();
  const navigate = useNavigate();

  // Fetch all batches and their teams
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/batches`);
      const data = await response.json();
      if (data.success) {
        setBatches(data.data);
        
        // If we have URL parameters, set the appropriate states
        if (batchNumber && data.data.length > 0) {
          const batch = data.data.find(b => b.batchNumber === parseInt(batchNumber));
          if (batch) {
            setSelectedBatch(batch);
            
            // If we also have a team number, select the team
            if (teamNumber && batch.teams) {
              const team = batch.teams.find(t => t.teamNumber === parseInt(teamNumber));
              if (team) {
                setSelectedProject({ ...team, batchNumber: batch.batchNumber });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [batchNumber, teamNumber]);

  // Handle navigation with URL updates
  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setSelectedProject(null);
    navigate(`/projectlink/batch/${batch.batchNumber}`);
  };

  const handleProjectSelect = (team) => {
    const project = { ...team, batchNumber: selectedBatch.batchNumber };
    setSelectedProject(project);
    navigate(`/projectlink/batch/${selectedBatch.batchNumber}/team/${team.teamNumber}`);
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setSelectedProject(null);
    navigate('/projectlink');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    navigate(`/projectlink/batch/${selectedBatch.batchNumber}`);
  };

  // ===== 1. Batch List with Search Bar =====
  if (!selectedBatch && !selectedProject) {
    return (
      <div className="showcase-container">
        <header className="showcase-header">
          <div className="header-content">
            <h1 className="main-title">Project Showcase</h1>
            <p className="main-subtitle">Search for a batch to see its projects</p>
            <input
              type="text"
              placeholder="Search batch no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                marginTop: "2rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "999px",
                border: "1.5px solid #667eea",
                fontSize: "1.1rem",
                outline: "none",
                width: "300px",
                maxWidth: "100%",
              }}
            />
          </div>
        </header>
        <main className="showcase-main">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading batches...</p>
            </div>
          ) : (
            <section style={{ width: '100%', maxWidth: 600, margin: '3rem auto 0 auto' }}>
              {batches
                .filter(batch =>
                  String(batch.batchNumber).toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(batch => (
                  <div
                    key={batch._id}
                    onClick={() => handleBatchSelect(batch)}
                    style={{
                      cursor: "pointer",
                      background: "#fff",
                      borderRadius: 16,
                      padding: "1.5rem 2rem",
                      marginBottom: 24,
                      boxShadow: "0 2px 12px rgba(102,126,234,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "2px solid #e0e7ff",
                      transition: "box-shadow 0.18s, border-color 0.18s"
                    }}
                  >
                    <span className="batch-number">Batch {batch.batchNumber}</span>
                    <span className="team-count">
                      <Users size={18} />
                      {batch.teams?.length || 0} Projects
                    </span>
                  </div>
                ))}
              {batches.length === 0 && !loading && (
                <div className="empty-state">
                  <h3>No batches found</h3>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    );
  }

  // ===== 2. Projects List for Selected Batch =====
  if (selectedBatch && !selectedProject) {
    return (
      <div className="showcase-container">
        <header className="showcase-header">
          <button className="back-button" style={{marginBottom: 16}} onClick={handleBackToBatches}>
            <ArrowLeft size={20} /> All Batches
          </button>
          <h2 className="batch-title" style={{marginTop: 18}}>
            <span className="batch-number">Batch {selectedBatch.batchNumber}</span>
            <span className="team-count">
              <Users size={16}/>
              {selectedBatch.teams?.length || 0} Projects
            </span>
          </h2>
        </header>
        <main className="showcase-main">
          {(selectedBatch.teams && selectedBatch.teams.length > 0) ? (
            <div className="projects-grid">
              {selectedBatch.teams.map(team => (
                <article
                  key={team._id}
                  className="project-card"
                  onClick={() => handleProjectSelect(team)}
                >
                  {/* Card image */}
                  <div className="card-image-container">
                    <img 
                      src={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${team.teamNumber}/image`}
                      alt={team.title}
                      className="card-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxNDAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJtMTMwIDExMCAxMC0xMCAxMCAxMC0yMCAwIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                    <div className="card-overlay">
                      <div className="overlay-content">
                        <Eye size={24} className="view-icon" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>
                  {/* Card content */}
                  <div className="card-content">
                    <div className="card-header">
                      <span className="team-badge">Team {team.teamNumber}</span>
                    </div>
                    <h3 className="card-title">{team.title}</h3>
                    <p className="card-description">
                      {team.description && team.description.length > 120 
                        ? `${team.description.substring(0, 120)}...` 
                        : team.description || 'No description available'
                      }
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-batch">No projects available in this batch</div>
          )}
        </main>
      </div>
    );
  }

  // ===== 3. Project Details View =====
  if (selectedProject) {
    return (
      <div className="details-container">
        <header className="details-header">
          <button onClick={handleBackToProjects} className="back-button">
            <ArrowLeft size={20} />
            Back to Projects
          </button>
        </header>
        <main className="details-main">
          <div className="details-grid">
            <div className="details-image-section">
              <div className="details-image-container">
                <img 
                  src={`${API_BASE_URL}/batches/${selectedProject.batchNumber}/teams/${selectedProject.teamNumber}/image`}
                  alt={selectedProject.title}
                  className="details-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwSDMwMFYyMDBIMjAwVjEwMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjIzMCIgY3k9IjEzMCIgcj0iOCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJtMjEwIDE4MCAyMC0yMCAyMCAyMC00MCA0IiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE4Ij5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
                {/* Show video if exists */}
                {selectedProject.video && (
                  <div style={{marginTop: '1rem'}}>
                    <video
                      width="400"
                      height="225"
                      controls
                      style={{borderRadius: 8, background: '#000'}}
                    >
                      <source src={`${API_BASE_URL}/batches/${selectedProject.batchNumber}/teams/${selectedProject.teamNumber}/video`} type={selectedProject.video.contentType || 'video/mp4'} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            </div>
            <div className="details-content-section">
              <div className="details-content">
                <div className="project-meta">
                  <span className="batch-badge">Batch {selectedProject.batchNumber}</span>
                  <span className="team-badge-large">Team {selectedProject.teamNumber}</span>
                </div>
                <h1 className="details-title">{selectedProject.title}</h1>
                <div className="details-description">
                  <p>{selectedProject.description || 'No description available for this project.'}</p>
                </div>
                <div className="project-actions">
                  {selectedProject.deploymentLink && (
                    <a 
                      href={selectedProject.deploymentLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-button primary"
                    >
                      <ExternalLink size={20} />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {selectedProject.githubLink && (
                    <a 
                      href={selectedProject.githubLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-button secondary"
                    >
                      <Github size={20} />
                      <span>Source Code</span>
                    </a>
                  )}
                  <a 
                    href={`${API_BASE_URL}/batches/${selectedProject.batchNumber}/teams/${selectedProject.teamNumber}/document`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button outline"
                  >
                    <Eye size={20} />
                    <span>Documentation</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default ProjectShowcase;