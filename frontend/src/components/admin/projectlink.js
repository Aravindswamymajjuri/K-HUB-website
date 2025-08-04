import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Download, Upload, X, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import '../admin/projectlink.css'; // Adjust path as needed

const API_BASE_URL = 'http://localhost:5000/api/projects'; // Adjust as needed

const ProjectBatchApp = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [teamForm, setTeamForm] = useState({
    teamNumber: '',
    title: '',
    description: '',
    deploymentLink: '',
    githubLink: '',
    projectImage: null,
    document: null,
    video: null
  });

  const { batchNumber } = useParams();
  const navigate = useNavigate();

  // Show confirmation dialog
  const showConfirmation = (title, message, onConfirm) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm
    });
  };

  // Hide confirmation dialog
  const hideConfirmation = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
  };

  // Fetch batches from API
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/batches`);
      const data = await response.json();
      if (data.success) {
        setBatches(data.data);
        
        // If we have a batchNumber parameter, set the selected batch
        if (batchNumber && data.data.length > 0) {
          const batch = data.data.find(b => b.batchNumber === parseInt(batchNumber));
          if (batch) {
            setSelectedBatch(batch);
          }
        }
      }
    } catch (error) {
      alert('Error fetching batches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new batch
  const createBatch = async () => {
    if (!newBatchNumber) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchNumber: parseInt(newBatchNumber) })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBatches();
        setShowCreateBatch(false);
        setNewBatchNumber('');
        alert('Batch created successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error creating batch: ' + error.message);
    }
  };

  // Add team to batch
  const addTeam = async () => {
    if (!selectedBatch || !teamForm.teamNumber || !teamForm.title || !teamForm.projectImage || !teamForm.document) {
      alert('Please fill all required fields and select files');
      return;
    }

    const formData = new FormData();
    formData.append('teamNumber', teamForm.teamNumber);
    formData.append('title', teamForm.title);
    formData.append('description', teamForm.description);
    formData.append('deploymentLink', teamForm.deploymentLink);
    formData.append('githubLink', teamForm.githubLink);
    formData.append('projectImage', teamForm.projectImage);
    formData.append('document', teamForm.document);
    if (teamForm.video) {
      formData.append('video', teamForm.video);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBatchDetails(selectedBatch.batchNumber);
        setShowAddTeam(false);
        resetTeamForm();
        alert('Team added successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error adding team: ' + error.message);
    }
  };

  // Update team
  const updateTeam = async () => {
    if (!selectedBatch || !editingTeam || !teamForm.title) {
      alert('Please fill required fields');
      return;
    }

    const formData = new FormData();
    if (teamForm.title) formData.append('title', teamForm.title);
    if (teamForm.description) formData.append('description', teamForm.description);
    if (teamForm.deploymentLink) formData.append('deploymentLink', teamForm.deploymentLink);
    if (teamForm.githubLink) formData.append('githubLink', teamForm.githubLink);
    if (teamForm.projectImage) formData.append('projectImage', teamForm.projectImage);
    if (teamForm.document) formData.append('document', teamForm.document);
    if (teamForm.video) formData.append('video', teamForm.video);

    try {
      const response = await fetch(`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${editingTeam.teamNumber}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBatchDetails(selectedBatch.batchNumber);
        setEditingTeam(null);
        resetTeamForm();
        alert('Team updated successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error updating team: ' + error.message);
    }
  };

  // Delete batch
  const deleteBatch = async (batchNum) => {
    showConfirmation(
      'Delete Batch',
      'Are you sure you want to delete this batch? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/batches/${batchNum}`, {
            method: 'DELETE'
          });
          
          const data = await response.json();
          if (data.success) {
            fetchBatches();
            if (selectedBatch?.batchNumber === batchNum) {
              setSelectedBatch(null);
              navigate('/addprojectlink'); // Navigate back to main view
            }
            alert('Batch deleted successfully!');
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert('Error deleting batch: ' + error.message);
        }
        hideConfirmation();
      }
    );
  };

  // Delete team
  const deleteTeam = async (teamNumber) => {
    showConfirmation(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${teamNumber}`, {
            method: 'DELETE'
          });
          
          const data = await response.json();
          if (data.success) {
            fetchBatchDetails(selectedBatch.batchNumber);
            alert('Team deleted successfully!');
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert('Error deleting team: ' + error.message);
        }
        hideConfirmation();
      }
    );
  };

  // Fetch batch details with navigation
  const fetchBatchDetails = async (batchNum) => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${batchNum}`);
      const data = await response.json();
      if (data.success) {
        setSelectedBatch(data.data);
        // Update URL to reflect selected batch
        navigate(`/addprojectlink/batch/${batchNum}`);
      }
    } catch (error) {
      alert('Error fetching batch details: ' + error.message);
    }
  };

  // Handle batch selection with navigation
  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    navigate(`/addprojectlink/batch/${batch.batchNumber}`);
  };

  // Handle back to all batches
  const handleBackToBatches = () => {
    setSelectedBatch(null);
    navigate('/addprojectlink');
  };

  // Reset team form
  const resetTeamForm = () => {
    setTeamForm({
      teamNumber: '',
      title: '',
      description: '',
      deploymentLink: '',
      githubLink: '',
      projectImage: null,
      document: null,
      video: null
    });
  };

  // Handle file input
  const handleFileChange = (e, fieldName) => {
    setTeamForm(prev => ({
      ...prev,
      [fieldName]: e.target.files[0]
    }));
  };

  // Start editing team
  const startEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      teamNumber: team.teamNumber,
      title: team.title,
      description: team.description,
      deploymentLink: team.deploymentLink,
      githubLink: team.githubLink,
      projectImage: null,
      document: null,
      video: null
    });
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowAddTeam(false);
    setEditingTeam(null);
    resetTeamForm();
  };

  useEffect(() => {
    fetchBatches();
  }, [batchNumber]);

  return (
    <div className="project-batch-container">
      <div className="main-content">
        <h1 className="main-title">Project Batch Management</h1>
        
        <div className="grid-layout">
          {/* Batches List */}
          <div>
            <div className="batches-card">
              <div className="batches-header">
                <h2 className="section-title">Batches</h2>
                <button
                  onClick={() => setShowCreateBatch(true)}
                  className="add-batch-btn"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {loading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <div className="batches-list">
                  {batches.map(batch => (
                    <div
                      key={batch._id}
                      className={`batch-item ${selectedBatch?._id === batch._id ? 'selected' : ''}`}
                      onClick={() => handleBatchSelect(batch)}
                    >
                      <div className="batch-item-content">
                        <div className="batch-info">
                          <p className="batch-number">Batch {batch.batchNumber}</p>
                          <p className="team-count">{batch.teams?.length || 0} teams</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBatch(batch.batchNumber);
                          }}
                          className="delete-batch-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Batch Details */}
          <div>
            {selectedBatch ? (
              <div className="teams-card">
                <div className="teams-header">
                  <h2 className="teams-title">
                    Batch {selectedBatch.batchNumber} Teams
                    <button
                      onClick={handleBackToBatches}
                      className="back-to-batches-btn"
                      style={{
                        marginLeft: '1rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      ← All Batches
                    </button>
                  </h2>
                  <button
                    onClick={() => setShowAddTeam(true)}
                    className="add-team-btn"
                  >
                    <Plus size={16} />
                    Add Team
                  </button>
                </div>

                <div className="teams-grid">
                  {selectedBatch.teams?.map(team => (
                    <div key={team._id} className="team-item">
                      <div className="team-item-content">
                        <div className="team-info">
                          <h3 className="team-title">Team {team.teamNumber}: {team.title}</h3>
                          <p className="team-description">{team.description}</p>
                          <div className="team-links">
                            <a 
                              href={team.deploymentLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="team-link"
                            >
                              🚀 Deployment Link
                            </a>
                            <a 
                              href={team.githubLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="team-link"
                            >
                              📁 GitHub Repository
                            </a>
                          </div>
                          <div className="team-files">
                            <a 
                              href={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${team.teamNumber}/image`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              <Eye size={16} /> View Image
                            </a>
                            <a 
                              href={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${team.teamNumber}/document`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              <Download size={16} /> Download Document
                            </a>
                            {/* Show video if exists */}
                            {team.video && (
                              <div style={{marginTop: '1rem'}}>
                                <video
                                  width="320"
                                  height="180"
                                  controls
                                  style={{borderRadius: 8, background: '#000'}}
                                >
                                  <source src={`${API_BASE_URL}/batches/${selectedBatch.batchNumber}/teams/${team.teamNumber}/video`} type={team.video.contentType || 'video/mp4'} />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="team-actions">
                          <button
                            onClick={() => startEditTeam(team)}
                            className="edit-team-btn"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTeam(team.teamNumber)}
                            className="delete-team-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedBatch.teams || selectedBatch.teams.length === 0) && (
                    <div className="no-teams-message">
                      No teams in this batch yet. Add a team to get started!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="teams-card">
                <div className="no-batch-selected">
                  Select a batch to view its teams
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Batch Modal */}
        {showCreateBatch && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Create New Batch</h3>
                <button 
                  onClick={() => setShowCreateBatch(false)}
                  className="close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="form-container">
                <input
                  type="number"
                  placeholder="Batch Number"
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  className="form-input"
                />
                <div className="btn-group">
                  <button
                    onClick={createBatch}
                    className="btn btn-primary"
                  >
                    Create Batch
                  </button>
                  <button
                    onClick={() => setShowCreateBatch(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Team Modal */}
        {(showAddTeam || editingTeam) && (
          <div className="modal-overlay">
            <div className="modal-content large">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingTeam ? 'Edit Team' : 'Add New Team'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="form-container">
                {!editingTeam && (
                  <input
                    type="number"
                    placeholder="Team Number"
                    value={teamForm.teamNumber}
                    onChange={(e) => setTeamForm(prev => ({...prev, teamNumber: e.target.value}))}
                    className="form-input"
                  />
                )}
                
                <input
                  type="text"
                  placeholder="Project Title"
                  value={teamForm.title}
                  onChange={(e) => setTeamForm(prev => ({...prev, title: e.target.value}))}
                  className="form-input"
                />
                
                <textarea
                  placeholder="Project Description"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                  className="form-textarea"
                />
                
                <input
                  type="url"
                  placeholder="Deployment Link"
                  value={teamForm.deploymentLink}
                  onChange={(e) => setTeamForm(prev => ({...prev, deploymentLink: e.target.value}))}
                  className="form-input"
                />
                
                <input
                  type="url"
                  placeholder="GitHub Link"
                  value={teamForm.githubLink}
                  onChange={(e) => setTeamForm(prev => ({...prev, githubLink: e.target.value}))}
                  className="form-input"
                />
                
                <div className="file-input-container">
                  <label className="file-label">
                    Project Image {!editingTeam && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'projectImage')}
                    className="file-input"
                  />
                </div>

                <div className="file-input-container">
                  <label className="file-label">
                    Document {!editingTeam && '*'}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'document')}
                    className="file-input"
                  />
                </div>

                <div className="file-input-container">
                  <label className="file-label">
                    Video (optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="file-input"
                  />
                </div>
                
                <div className="btn-group">
                  <button
                    onClick={editingTeam ? updateTeam : addTeam}
                    className="btn btn-success"
                  >
                    <Save size={16} />
                    {editingTeam ? 'Update Team' : 'Add Team'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="modal-overlay">
            <div className="confirm-dialog-content">
              <h3 className="confirm-title">{confirmDialog.title}</h3>
              <p className="confirm-message">{confirmDialog.message}</p>
              <div className="btn-group">
                <button
                  onClick={confirmDialog.onConfirm}
                  className="btn btn-danger"
                >
                  Confirm
                </button>
                <button
                  onClick={hideConfirmation}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBatchApp;