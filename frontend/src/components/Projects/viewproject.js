import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './viewproject.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faDownload, faFileAlt, faVideo } from '@fortawesome/free-solid-svg-icons';

const ViewProjects = () => {
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [teamNumbers, setTeamNumbers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/projects/batch-numbers'),
      axios.get('http://localhost:5000/api/projects/team-numbers')
    ])
      .then(([batchRes, teamRes]) => {
        setBatchNumbers(batchRes.data);
        setTeamNumbers(teamRes.data);
      })
      .catch(error => {
        console.error('Error fetching batch/team numbers:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBatch !== '' || selectedTeam !== '') {
      setLoading(true);
      axios.get(`http://localhost:5000/api/projects?batchNumber=${selectedBatch}&teamNumber=${selectedTeam}`)
        .then(response => {
          setProjects(response.data);
        })
        .catch(error => {
          console.error('Error fetching projects:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedBatch, selectedTeam]);

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    setSelectedTeam('');
  };

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };

  const handleDocumentDownload = async (projectId, filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/document`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleVideoDownload = async (projectId, filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/video`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video');
    }
  };

  const isVideoFile = (contentType) => {
    return contentType && contentType.startsWith('video/');
  };

  const canPlayInBrowser = (contentType) => {
    const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return supportedTypes.includes(contentType);
  };

  if (loading) {
    return (
      <div className="view-projects-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="view-projects-container" style={{ minHeight: '60vh' }}>
      <h3>.</h3>
      <h2 className="heading">𝗣𝗥𝗢𝗝𝗘𝗖𝗧𝗦</h2>
      <p className="subheading">Explore into our projects which have been done by our Khub during their internships</p>
      <div className="select-container">
        <div className="select-card">
          <label>Select Batch Number:</label>
          <select value={selectedBatch} onChange={handleBatchChange}>
            <option value="">-- Select Batch --</option>
            {batchNumbers.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
        <div className="select-card">
          <label>Select Team Number:</label>
          <select value={selectedTeam} onChange={handleTeamChange}>
            <option value="">-- Select Team --</option>
            {teamNumbers.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="projects-container">
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-info">
                <h3>{project.name}</h3>
                {project.previewImage && (
                  <div className="project-image">
                    <img 
                      src={`data:${project.previewImageType};base64,${project.previewImage}`} 
                      alt="Project Preview" 
                      className="preview-image"
                    />
                  </div>
                )}
                <div className="project-details">
                  <p><strong>Batch:</strong> {project.batchNumber}</p>
                  <p><strong>Team:</strong> {project.teamNumber}</p>
                  <p><strong>Developer:</strong> {project.developer}</p>
                  <p className="description-heading">Description:</p>
                  <p>{project.description}</p>
                  
                  {/* Links Section */}
                  <div className="project-links">
                    <div className="github-link">
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faGithub} /> GitHub
                      </a>
                    </div>
                    <div className="deployment-link">
                      <a href={project.deploymentLink} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Live Demo
                      </a>
                    </div>
                  </div>
                  <div className='media-section'> 
                  {/* Document Section */}
                  {project.document && project.document.filename && (
                    <div className="project-document">
                      <h4>📄 Project Document</h4>
                      <div className="document-info">
                        <span className="filename">{project.document.filename}</span>
                        <button 
                          onClick={() => handleDocumentDownload(project._id, project.document.filename)}
                          className="download-btn"
                          title="Download Document"
                        >
                          <FontAwesomeIcon icon={faDownload} /> Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Section */}
                  {project.video && project.video.filename && (
                    <div className="project-video">
                      <h4>🎥 Project Video</h4>
                      <div className="video-info">
                        <span className="filename">{project.video.filename}</span>
                        <button 
                          onClick={() => handleVideoDownload(project._id, project.video.filename)}
                          className="download-btn"
                          title="Download Video"
                        >
                          <FontAwesomeIcon icon={faDownload} /> Download
                        </button>
                      </div>
                      
                      {/* Video Preview (if supported by browser) */}
                      {isVideoFile(project.video.contentType) && canPlayInBrowser(project.video.contentType) && (
                        <div className="video-preview">
                          <video 
                            controls 
                            width="100%" 
                            height="200"
                            style={{ marginTop: '10px', borderRadius: '4px' }}
                          >
                            <source 
                              src={`data:${project.video.contentType};base64,${project.video.data}`} 
                              type={project.video.contentType} 
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewProjects;