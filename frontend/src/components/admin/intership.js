import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Award, Calendar, BarChart3, X } from 'lucide-react';
import './intership.css';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/interships';

const api = {
  // Batch operations
  getBatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/batches?${query}`);
    return response.json();
  },
  
  getBatch: async (batchNumber) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}`);
    return response.json();
  },
  
  createBatch: async (data) => {
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  updateBatch: async (batchNumber, data) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  deleteBatch: async (batchNumber) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  
  // Internship operations
  getInternships: async (batchNumber, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships?${query}`);
    return response.json();
  },
  
  getInternship: async (batchNumber, internshipId) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships/${internshipId}`);
    return response.json();
  },
  
  createInternship: async (batchNumber, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    if (data.imageFile) formData.append('image', data.imageFile);
    if (data.certificateFile) formData.append('certificate', data.certificateFile);

    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  updateInternship: async (batchNumber, internshipId, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    if (data.imageFile) formData.append('image', data.imageFile);
    if (data.certificateFile) formData.append('certificate', data.certificateFile);

    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships/${internshipId}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  
  deleteInternship: async (batchNumber, internshipId) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships/${internshipId}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  
  // Utility operations
  searchInternships: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/search/internships?${query}`);
    return response.json();
  },
  
  getBatchStats: async (batchNumber) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/stats`);
    return response.json();
  }
};

export default function InternshipManager() {
  // State management
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [showInternshipDetail, setShowInternshipDetail] = useState(false);
  const [detailInternship, setDetailInternship] = useState(null);
  
  // Form states
  const [batchForm, setBatchForm] = useState({ batchNumber: '' });
  const [internshipForm, setInternshipForm] = useState({
    name: '',
    rollNo: '',
    internshipTitle: '',
    company: '',
    duration: '',
    description: '',
    imageFile: null,
    certificateFile: null
  });
  const [searchForm, setSearchForm] = useState({
    name: '',
    rollNo: '',
    internshipTitle: '',
    batchNumber: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Load initial data
  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchInternships();
      fetchStats();
    }
  }, [selectedBatch, currentPage]);

  // API functions
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await api.getBatches();
      if (response.success) {
        setBatches(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const response = await api.getInternships(selectedBatch, { page: currentPage });
      if (response.success) {
        setInternships(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedBatch) return;
    try {
      const response = await api.getBatchStats(selectedBatch);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (editingBatch) {
        response = await api.updateBatch(editingBatch.batchNumber, batchForm);
      } else {
        response = await api.createBatch({ batchNumber: parseInt(batchForm.batchNumber) });
      }
      
      if (response.success) {
        await fetchBatches();
        setShowBatchModal(false);
        setBatchForm({ batchNumber: '' });
        setEditingBatch(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(editingBatch ? 'Failed to update batch' : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async (batchNumber) => {
    setDeleteTarget({ type: 'batch', id: batchNumber });
    setShowDeleteConfirm(true);
  };

  const handleInternshipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);
    try {
      let response;
      // Only append files if they exist
      const formData = new FormData();
      formData.append('name', internshipForm.name);
      formData.append('rollNo', internshipForm.rollNo);
      formData.append('internshipTitle', internshipForm.internshipTitle);
      formData.append('company', internshipForm.company);
      formData.append('duration', internshipForm.duration);
      formData.append('description', internshipForm.description);
      if (internshipForm.imageFile) formData.append('image', internshipForm.imageFile);
      if (internshipForm.certificateFile) formData.append('certificate', internshipForm.certificateFile);

      if (editingInternship) {
        response = await fetch(`${API_BASE_URL}/batches/${selectedBatch}/internships/${editingInternship._id}`, {
          method: 'PUT',
          body: formData
        }).then(res => res.json());
      } else {
        response = await fetch(`${API_BASE_URL}/batches/${selectedBatch}/internships`, {
          method: 'POST',
          body: formData
        }).then(res => res.json());
      }
      
      if (response.success) {
        await fetchInternships();
        await fetchStats();
        setShowInternshipModal(false);
        setInternshipForm({ name: '', rollNo: '', internshipTitle: '', company: '', duration: '', description: '' });
        setEditingInternship(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(editingInternship ? 'Failed to update internship' : 'Failed to create internship');
    } finally {
      setLoading(false);
    }
  };

  const handleInternshipDelete = async (internshipId) => {
    setDeleteTarget({ type: 'internship', id: internshipId });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setLoading(true);
    try {
      let response;
      if (deleteTarget.type === 'batch') {
        response = await api.deleteBatch(deleteTarget.id);
        if (response.success) {
          await fetchBatches();
          if (selectedBatch === deleteTarget.id) {
            setSelectedBatch(null);
            setInternships([]);
            setStats(null);
          }
        }
      } else if (deleteTarget.type === 'internship') {
        response = await api.deleteInternship(selectedBatch, deleteTarget.id);
        if (response.success) {
          await fetchInternships();
          await fetchStats();
        }
      }
      
      if (!response.success) {
        setError(response.message);
      }
    } catch (err) {
      setError(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.searchInternships(searchForm);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to search internships');
    } finally {
      setLoading(false);
    }
  };

  const openBatchModal = (batch = null) => {
    setEditingBatch(batch);
    setBatchForm(batch ? { batchNumber: batch.batchNumber } : { batchNumber: '' });
    setShowBatchModal(true);
  };

  const openInternshipModal = (internship = null) => {
    setEditingInternship(internship);
    setInternshipForm(internship ? {
      name: internship.name,
      rollNo: internship.rollNo,
      internshipTitle: internship.internshipTitle,
      company: internship.company || '',
      duration: internship.duration || '',
      description: internship.description || ''
    } : { name: '', rollNo: '', internshipTitle: '', company: '', duration: '', description: '' });
    setShowInternshipModal(true);
  };

  // Handler to open internship detail modal
  const openInternshipDetail = (internship) => {
    setDetailInternship(internship);
    setShowInternshipDetail(true);
  };

  return (
    <div className="gradient-background">
      <div className="container-main">
        <div className="header-main">
          <h1 className="heading-main">Internship Batch Manager</h1>
          <p className="subheading-main">Manage internship batches and student records</p>
        </div>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-error-btn">
              <X />
            </button>
          </div>
        )}
        <div className="layout-main">
          {/* Left Panel - Batches */}
          <div className="left-panel">
            <div className="custom-card">
              <div className="card-header">
                <h2 className="card-title">Batches</h2>
                <button onClick={() => openBatchModal()} className="btn-primary flex-row">
                  <Plus /> New Batch
                </button>
              </div>
              <div className="batch-list">
                {batches.map((batch) => (
                  <div
                    key={batch._id}
                    className={`batch-item${selectedBatch === batch.batchNumber ? ' selected' : ''}`}
                  >
                    <div className="batch-row">
                      <div onClick={() => setSelectedBatch(batch.batchNumber)} className="batch-info">
                        <h3 className="batch-title">Batch {batch.batchNumber}</h3>
                        <p className="batch-count">{batch.internships?.length || 0} internships</p>
                      </div>
                      <div className="batch-actions">
                        <button onClick={() => openBatchModal(batch)} className="icon-btn">
                          <Edit2 />
                        </button>
                        <button onClick={() => handleBatchDelete(batch.batchNumber)} className="icon-btn">
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Search Panel */}
            <div className="custom-card search-card">
              <h2 className="card-title">Search Internships</h2>
              <div className="search-fields">
                <input type="text" placeholder="Student name" value={searchForm.name}
                  onChange={e => setSearchForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input" />
                <input type="text" placeholder="Roll number" value={searchForm.rollNo}
                  onChange={e => setSearchForm(prev => ({ ...prev, rollNo: e.target.value }))}
                  className="form-input" />
                <input type="text" placeholder="Internship title" value={searchForm.internshipTitle}
                  onChange={e => setSearchForm(prev => ({ ...prev, internshipTitle: e.target.value }))}
                  className="form-input" />
                <input type="number" placeholder="Batch number" value={searchForm.batchNumber}
                  onChange={e => setSearchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                  className="form-input" />
                <button onClick={handleSearch} className="btn-success flex-row">
                  <Search /> Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="search-result">
                      <h4 className="result-title">{result.internship.name}</h4>
                      <p className="result-sub">{result.internship.internshipTitle}</p>
                      <p className="result-batch">Batch {result.batchNumber}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Right Panel - Internships */}
          <div className="right-panel">
            {selectedBatch ? (
              <>
                {stats && (
                  <div className="custom-card stats-card">
                    <h2 className="card-title flex-row">
                      <BarChart3 /> Batch {selectedBatch} Statistics
                    </h2>
                    <div className="stats-list">
                      <div className="stat-card blue">
                        <div className="stat-label flex-row"><Users /><span>Total</span></div>
                        <p className="stat-value">{stats.totalInternships}</p>
                      </div>
                      <div className="stat-card green">
                        <div className="stat-label flex-row"><Award /><span>Certificates</span></div>
                        <p className="stat-value">{stats.internshipsWithCertificates}</p>
                      </div>
                      <div className="stat-card purple">
                        <div className="stat-label flex-row"><Calendar /><span>Unique Titles</span></div>
                        <p className="stat-value">{stats.uniqueInternshipTitles}</p>
                      </div>
                      <div className="stat-card orange">
                        <div className="stat-label flex-row"><Users /><span>With Images</span></div>
                        <p className="stat-value">{stats.internshipsWithImages}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="custom-card">
                  <div className="card-header">
                    <h2 className="card-title">Internships - Batch {selectedBatch}</h2>
                    <button onClick={() => openInternshipModal()} className="btn-success flex-row">
                      <Plus /> Add Internship
                    </button>
                  </div>
                  <div className="internship-list">
                    {internships.map((internship) => (
                      <div
                        key={internship._id}
                        className="internship-card cursor-pointer"
                        onClick={() => openInternshipDetail(internship)}
                      >
                        <div className="internship-row">
                          <div className="internship-info">
                            <h3 className="internship-title">{internship.name}</h3>
                            <p className="internship-roll">Roll No: {internship.rollNo}</p>
                            <p className="internship-main">{internship.internshipTitle}</p>
                            {internship.company && <p className="internship-company">Company: {internship.company}</p>}
                            {internship.duration && <p className="internship-duration">Duration: {internship.duration}</p>}
                            {internship.description && <p className="internship-desc">{internship.description}</p>}
                            {internship.image && (
                              <div className="internship-img-wrap">
                                <img
                                  src={`http://localhost:5000/api/interships/batches/${selectedBatch}/internships/${internship._id}/image`}
                                  alt="Internship"
                                  className="internship-image-preview"
                                  onClick={e => { e.stopPropagation(); openInternshipDetail(internship); }}
                                />
                              </div>
                            )}
                            {internship.certificate && (
                              <div className="internship-cert-wrap">
                                <a
                                  href={`http://localhost:5000/api/interships/batches/${selectedBatch}/internships/${internship._id}/certificate`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="internship-certificate-link"
                                  onClick={e => e.stopPropagation()}
                                >
                                  View Certificate
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="internship-actions">
                            <button onClick={e => { e.stopPropagation(); openInternshipModal(internship); }} className="icon-btn">
                              <Edit2 />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleInternshipDelete(internship._id); }} className="icon-btn">
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="pagination-wrap">
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrev} className="pagination-button">Previous</button>
                      <span className="pagination-current">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNext} className="pagination-button">Next</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="custom-card empty-panel">
                <Users className="empty-icon" />
                <h3 className="empty-title">Select a Batch</h3>
                <p className="empty-desc">Choose a batch from the left panel to view internships</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="glassmorphism-modal p-6 w-full max-w-md rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Delete</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this {deleteTarget?.type}?
                {deleteTarget?.type === 'batch' && ' This will delete all internships in it.'}
                {' '}This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="btn-danger flex-1"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="btn-primary flex-1"
                  style={{ background: 'var(--gray-300)', color: 'var(--gray-700)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Modal */}
        {showBatchModal && (
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="glassmorphism-modal p-6 w-full max-w-md rounded-xl">
              <h2 className="text-xl font-semibold mb-4">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h2>
              <form onSubmit={handleBatchSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="number"
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="form-input w-full"
                    required
                    disabled={editingBatch}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Saving...' : (editingBatch ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="btn-primary flex-1"
                    style={{ background: 'var(--gray-300)', color: 'var(--gray-700)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Internship Modal */}
        {showInternshipModal && (
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="glassmorphism-modal p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
              <h2 className="text-xl font-semibold mb-4">
                {editingInternship ? 'Edit Internship' : 'Add New Internship'}
              </h2>
              <form onSubmit={handleInternshipSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={internshipForm.name}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={internshipForm.rollNo}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, rollNo: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internship Title *
                    </label>
                    <input
                      type="text"
                      value={internshipForm.internshipTitle}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, internshipTitle: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={internshipForm.company}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, company: e.target.value }))}
                      className="form-input w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={internshipForm.duration}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={internshipForm.description}
                      onChange={(e) => setInternshipForm(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input w-full"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setInternshipForm(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Upload
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setInternshipForm(prev => ({ ...prev, certificateFile: e.target.files[0] }))}
                      className="form-input w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-success flex-1"
                  >
                    {loading ? 'Saving...' : (editingInternship ? 'Update' : 'Add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInternshipModal(false)}
                    className="btn-primary flex-1"
                    style={{ background: 'var(--gray-300)', color: 'var(--gray-700)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Internship Detail Modal */}
        {showInternshipDetail && detailInternship && (
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="glassmorphism-modal p-6 w-full max-w-lg rounded-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                onClick={() => setShowInternshipDetail(false)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-2">{detailInternship.name}</h2>
              <p className="mb-1"><strong>Roll No:</strong> {detailInternship.rollNo}</p>
              <p className="mb-1"><strong>Internship Title:</strong> {detailInternship.internshipTitle}</p>
              {detailInternship.company && (
                <p className="mb-1"><strong>Company:</strong> {detailInternship.company}</p>
              )}
              {detailInternship.duration && (
                <p className="mb-1"><strong>Duration:</strong> {detailInternship.duration}</p>
              )}
              {detailInternship.description && (
                <p className="mb-2"><strong>Description:</strong> {detailInternship.description}</p>
              )}
              {detailInternship.image && (
                <div className="mb-3">
                  <img
                    src={`http://localhost:5000/api/interships/batches/${selectedBatch}/internships/${detailInternship._id}/image`}
                    alt="Internship"
                    className="internship-image-preview"
                  />
                </div>
              )}
              {detailInternship.certificate && (
                <div>
                  <a
                    href={`http://localhost:5000/api/interships/batches/${selectedBatch}/internships/${detailInternship._id}/certificate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="internship-certificate-link"
                  >
                    View Certificate
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}