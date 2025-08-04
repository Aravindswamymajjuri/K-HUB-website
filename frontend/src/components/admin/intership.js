import React, { useState, useEffect } from 'react';
import './intership.css';
import { Search, Plus, Edit2, Trash2, Users, Award, Calendar, BarChart3, X, ArrowLeft } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/interships';

const api = {
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

const UrlNavigator = {
  parseUrl: () => {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/').filter(Boolean);
    if (parts.length === 0) {
      return { view: 'batches' };
    }
    if (parts[0] === 'batch' && parts[1]) {
      if (parts[2] === 'internship' && parts[3]) {
        return {
          view: 'internship-detail',
          batchNumber: parts[1],
          internshipId: parts[3]
        };
      }
      return {
        view: 'batch-internships',
        batchNumber: parts[1]
      };
    }
    return { view: 'batches' };
  },
  navigateTo: (route) => {
    let hash = '';
    switch (route.view) {
      case 'batches':
        hash = '';
        break;
      case 'batch-internships':
        hash = `#batch/${route.batchNumber}`;
        break;
      case 'internship-detail':
        hash = `#batch/${route.batchNumber}/internship/${route.internshipId}`;
        break;
      default:
        hash = '';
    }
    window.location.hash = hash;
  }
};

export default function InternshipManager() {
  const [currentRoute, setCurrentRoute] = useState(UrlNavigator.parseUrl());
  const [batches, setBatches] = useState([]);
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [showInternshipDetail, setShowInternshipDetail] = useState(false);
  const [detailInternship, setDetailInternship] = useState(null);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = UrlNavigator.parseUrl();
      setCurrentRoute(newRoute);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    const { view, batchNumber, internshipId } = currentRoute;
    if (view === 'batch-internships' && batchNumber) {
      fetchInternships(batchNumber);
      fetchStats(batchNumber);
      setShowInternshipDetail(false);
      setDetailInternship(null);
    } else if (view === 'internship-detail' && batchNumber && internshipId) {
      fetchInternships(batchNumber);
      fetchStats(batchNumber);
      fetchInternshipDetail(batchNumber, internshipId);
    } else if (view === 'batches') {
      setInternships([]);
      setStats(null);
      setShowInternshipDetail(false);
      setDetailInternship(null);
    }
  }, [currentRoute, currentPage]);

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

  const fetchInternships = async (batchNumber) => {
    if (!batchNumber) return;
    setLoading(true);
    try {
      const response = await api.getInternships(batchNumber, { page: currentPage });
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

  const fetchStats = async (batchNumber) => {
    if (!batchNumber) return;
    try {
      const response = await api.getBatchStats(batchNumber);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchInternshipDetail = async (batchNumber, internshipId) => {
    try {
      const response = await api.getInternship(batchNumber, internshipId);
      if (response.success) {
        setDetailInternship(response.data);
        setShowInternshipDetail(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch internship details');
    }
  };

  const handleBatchSelect = (batchNumber) => {
    UrlNavigator.navigateTo({ view: 'batch-internships', batchNumber });
  };

  const handleBackToBatches = () => {
    UrlNavigator.navigateTo({ view: 'batches' });
  };

  const handleInternshipDetail = (internship) => {
    UrlNavigator.navigateTo({
      view: 'internship-detail',
      batchNumber: currentRoute.batchNumber,
      internshipId: internship._id
    });
  };

  const handleCloseInternshipDetail = () => {
    UrlNavigator.navigateTo({
      view: 'batch-internships',
      batchNumber: currentRoute.batchNumber
    });
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
    const { batchNumber } = currentRoute;
    if (!batchNumber) return;

    setLoading(true);
    try {
      let response;
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
        response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships/${editingInternship._id}`, {
          method: 'PUT',
          body: formData
        }).then(res => res.json());
      } else {
        response = await fetch(`${API_BASE_URL}/batches/${batchNumber}/internships`, {
          method: 'POST',
          body: formData
        }).then(res => res.json());
      }
      if (response.success) {
        await fetchInternships(batchNumber);
        await fetchStats(batchNumber);
        setShowInternshipModal(false);
        setInternshipForm({ name: '', rollNo: '', internshipTitle: '', company: '', duration: '', description: '', imageFile: null, certificateFile: null });
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
          if (currentRoute.batchNumber === deleteTarget.id) {
            UrlNavigator.navigateTo({ view: 'batches' });
          }
        }
      } else if (deleteTarget.type === 'internship') {
        response = await api.deleteInternship(currentRoute.batchNumber, deleteTarget.id);
        if (response.success) {
          await fetchInternships(currentRoute.batchNumber);
          await fetchStats(currentRoute.batchNumber);
          if (currentRoute.internshipId === deleteTarget.id) {
            UrlNavigator.navigateTo({
              view: 'batch-internships',
              batchNumber: currentRoute.batchNumber
            });
          }
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
      description: internship.description || '',
      imageFile: null,
      certificateFile: null
    } : { name: '', rollNo: '', internshipTitle: '', company: '', duration: '', description: '', imageFile: null, certificateFile: null });
    setShowInternshipModal(true);
  };

  const { view, batchNumber } = currentRoute;

  return (
    <div className="app-background">
      <div className="app-container">
        <div className="title-section">
          <h1 className="main-title">Internship Batch Manager</h1>
          <p className="main-desc">Manage internship batches and student records</p>
          <div className="breadcrumb">
            <button
              onClick={() => UrlNavigator.navigateTo({ view: 'batches' })}
              className={`breadcrumb-link ${view === 'batches' ? 'active' : ''}`}
            >
              All Batches
            </button>
            {batchNumber && (
              <>
                <span className="breadcrumb-sep">/</span>
                <button
                  onClick={() => UrlNavigator.navigateTo({ view: 'batch-internships', batchNumber })}
                  className={`breadcrumb-link ${view === 'batch-internships' ? 'active' : ''}`}
                >
                  Batch {batchNumber}
                </button>
              </>
            )}
            {view === 'internship-detail' && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-detail">Internship Details</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-error">
            {error}
            <button onClick={() => setError(null)} className="alert-close" aria-label="Close error">
              <X />
            </button>
          </div>
        )}

        <div className="layout-main">
          {/* Left Panel */}
          <div className="sidebar">
            {view !== 'batches' && (
              <button onClick={handleBackToBatches} className="back-btn">
                <ArrowLeft />
                <span>Back to All Batches</span>
              </button>
            )}

            <div className="sidebar-panel">
              <div className="sidebar-panel-header">
                <h2 className="sidebar-title">Batches</h2>
                <button onClick={() => openBatchModal()} className="sidebar-add-btn">
                  <Plus />
                  <span>New Batch</span>
                </button>
              </div>
              <div className="batch-list">
                {batches.map((batch) => (
                  <div
                    key={batch._id}
                    className={`batch-list-item ${batchNumber == batch.batchNumber ? 'selected' : ''}`}
                  >
                    <div className="batch-item-main" onClick={() => handleBatchSelect(batch.batchNumber)}>
                      <h3 className="batch-title">Batch {batch.batchNumber}</h3>
                      <p className="batch-count">{batch.internships?.length || 0} internships</p>
                    </div>
                    <div className="batch-actions">
                      <button onClick={(e) => { e.stopPropagation(); openBatchModal(batch); }} className="icon-btn blue" aria-label="Edit Batch">
                        <Edit2 />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleBatchDelete(batch.batchNumber); }} className="icon-btn red" aria-label="Delete Batch">
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-panel search-panel">
              <h2 className="sidebar-title">Search Internships</h2>
              <div className="search-fields">
                <input
                  type="text"
                  placeholder="Student name"
                  value={searchForm.name}
                  onChange={e => setSearchForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Roll number"
                  value={searchForm.rollNo}
                  onChange={e => setSearchForm(prev => ({ ...prev, rollNo: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Internship title"
                  value={searchForm.internshipTitle}
                  onChange={e => setSearchForm(prev => ({ ...prev, internshipTitle: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Batch number"
                  value={searchForm.batchNumber}
                  onChange={e => setSearchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                  className="input-field"
                />
                <button onClick={handleSearch} className="search-btn" aria-label="Search Internships">
                  <Search />
                  <span>Search</span>
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3 className="search-results-title">Search Results</h3>
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="search-result-item">
                      <h4 className="search-result-name">{result.internship.name}</h4>
                      <p className="search-result-title">{result.internship.internshipTitle}</p>
                      <p className="search-result-batch">Batch {result.batchNumber}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="content-panel">
            {view !== 'batches' && batchNumber ? (
              <>
                {stats && (
                  <div className="stats-panel">
                    <h2 className="stats-title">
                      <BarChart3 className="stats-icon" />
                      Batch {batchNumber} Statistics
                    </h2>
                    <div className="stats-grid">
                      <div className="stats-card blue">
                        <Users className="stats-card-icon" />
                        <p className="stats-number">{stats.totalInternships}</p>
                        <p className="stats-label">Total</p>
                      </div>
                      <div className="stats-card green">
                        <Award className="stats-card-icon" />
                        <p className="stats-number">{stats.internshipsWithCertificates}</p>
                        <p className="stats-label">Certificates</p>
                      </div>
                      <div className="stats-card purple">
                        <Calendar className="stats-card-icon" />
                        <p className="stats-number">{stats.uniqueInternshipTitles}</p>
                        <p className="stats-label">Unique Titles</p>
                      </div>
                      <div className="stats-card orange">
                        <Users className="stats-card-icon" />
                        <p className="stats-number">{stats.internshipsWithImages}</p>
                        <p className="stats-label">With Images</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="internship-panel">
                  <div className="internship-panel-header">
                    <h2 className="internship-title">Internships - Batch {batchNumber}</h2>
                    <button onClick={() => openInternshipModal()} className="internship-add-btn" aria-label="Add Internship">
                      <Plus /><span>Add Internship</span>
                    </button>
                  </div>
                  <div className="internship-list">
                    {internships.map((internship) => (
                      <div
                        key={internship._id}
                        className="internship-item"
                        onClick={() => handleInternshipDetail(internship)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => { if(e.key === 'Enter') handleInternshipDetail(internship); }}
                      >
                        <div className="internship-info">
                          <h3 className="internship-name">{internship.name}</h3>
                          <p className="internship-rollno">Roll No: {internship.rollNo}</p>
                          <p className="internship-title-text">{internship.internshipTitle}</p>
                          {internship.company && <p className="internship-company">Company: {internship.company}</p>}
                          {internship.duration && <p className="internship-duration">Duration: {internship.duration}</p>}
                          {internship.description && <p className="internship-description">{internship.description}</p>}
                          <div className="internship-meta">
                            {internship.image && (
                              <div className="meta-item image-meta">📷 Image attached</div>
                            )}
                            {internship.certificate && (
                              <div className="meta-item certificate-meta">📄 Certificate attached</div>
                            )}
                          </div>
                        </div>
                        <div className="internship-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); openInternshipModal(internship); }}
                            className="icon-btn blue"
                            aria-label="Edit Internship"
                          >
                            <Edit2 />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleInternshipDelete(internship._id); }}
                            className="icon-btn red"
                            aria-label="Delete Internship"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrev}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={!pagination.hasNext}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-select">
                <Users className="empty-icon" />
                <h3 className="empty-title">Select a Batch</h3>
                <p className="empty-desc">Choose a batch from the left panel to view internships</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 className="modal-title danger">Confirm Delete</h2>
              <p className="modal-text">
                Are you sure you want to delete this {deleteTarget?.type}?
                {deleteTarget?.type === 'batch' && ' This will delete all internships in it.'} This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="btn-danger"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Modal */}
        {showBatchModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 className="modal-title">{editingBatch ? 'Edit Batch' : 'Create New Batch'}</h2>
              <form onSubmit={handleBatchSubmit} className="form">
                <div className="form-group">
                  <label htmlFor="batchNumber" className="form-label">Batch Number</label>
                  <input
                    id="batchNumber"
                    type="number"
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="input-field"
                    required
                    disabled={!!editingBatch}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : (editingBatch ? 'Update' : 'Create')}
                  </button>
                  <button type="button" onClick={() => setShowBatchModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Internship Modal */}
        {showInternshipModal && (
          <div className="modal-overlay">
            <div className="modal-box modal-large">
              <h2 className="modal-title">{editingInternship ? 'Edit Internship' : 'Add New Internship'}</h2>
              <form onSubmit={handleInternshipSubmit} className="form internship-form">
                <div className="field-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Student Name *</label>
                    <input
                      id="name"
                      type="text"
                      value={internshipForm.name}
                      onChange={e => setInternshipForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rollNo" className="form-label">Roll Number *</label>
                    <input
                      id="rollNo"
                      type="text"
                      value={internshipForm.rollNo}
                      onChange={e => setInternshipForm(prev => ({ ...prev, rollNo: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label htmlFor="internshipTitle" className="form-label">Internship Title *</label>
                    <input
                      id="internshipTitle"
                      type="text"
                      value={internshipForm.internshipTitle}
                      onChange={e => setInternshipForm(prev => ({ ...prev, internshipTitle: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input
                      id="company"
                      type="text"
                      value={internshipForm.company}
                      onChange={e => setInternshipForm(prev => ({ ...prev, company: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label htmlFor="duration" className="form-label">Duration</label>
                    <input
                      id="duration"
                      type="text"
                      value={internshipForm.duration}
                      onChange={e => setInternshipForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      id="description"
                      value={internshipForm.description}
                      onChange={e => setInternshipForm(prev => ({ ...prev, description: e.target.value }))}
                      className="textarea-field"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label htmlFor="imageFile" className="form-label">Image Upload</label>
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={e => setInternshipForm(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="certificateFile" className="form-label">Certificate Upload</label>
                    <input
                      id="certificateFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setInternshipForm(prev => ({ ...prev, certificateFile: e.target.files[0] }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : (editingInternship ? 'Update' : 'Add')}
                  </button>
                  <button type="button" onClick={() => setShowInternshipModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Internship Detail Modal */}
        {showInternshipDetail && detailInternship && (
          <div className="modal-overlay">
            <div className="modal-box">
              <button
                className="modal-close"
                onClick={handleCloseInternshipDetail}
                aria-label="Close internship details"
              >
                <X />
              </button>
              <h2 className="modal-title">{detailInternship.name}</h2>
              <p><strong>Roll No:</strong> {detailInternship.rollNo}</p>
              <p><strong>Internship Title:</strong> {detailInternship.internshipTitle}</p>
              {detailInternship.company && <p><strong>Company:</strong> {detailInternship.company}</p>}
              {detailInternship.duration && <p><strong>Duration:</strong> {detailInternship.duration}</p>}
              {detailInternship.description && <p className="modal-description"><strong>Description:</strong> {detailInternship.description}</p>}
              {detailInternship.image && (
                <div className="modal-image">
                  <img
                    src={`http://localhost:5000/api/interships/batches/${batchNumber}/internships/${detailInternship._id}/image`}
                    alt="Internship"
                    className="image-preview"
                  />
                </div>
              )}
              {detailInternship.certificate && (
                <div className="modal-certificate">
                  <a
                    href={`http://localhost:5000/api/interships/batches/${batchNumber}/internships/${detailInternship._id}/certificate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-link"
                  >
                    <span>📄</span>
                    <span>View Certificate</span>
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
