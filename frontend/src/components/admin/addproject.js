import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const validateUrl = url => /^https?:\/\/.+/.test(url);

const AddProject = () => {
  const [project, setProject] = useState({
    batchNumber: '',
    teamNumber: '',
    name: '',
    description: '',
    githubLink: '',
    deploymentLink: '',
    developer: '',
    previewImage: null,
    document: null,
    video: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setProject({ ...project, [name]: files[0] });
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!project.batchNumber || !project.teamNumber || !project.name || 
        !project.description || !project.githubLink || !project.deploymentLink || 
        !project.developer) {
      toast.error('All fields except preview image and video are required!');
      return false;
    }

    // Validate URLs
    if (!validateUrl(project.githubLink)) {
      toast.error('Please enter a valid GitHub link!');
      return false;
    }

    if (!validateUrl(project.deploymentLink)) {
      toast.error('Please enter a valid deployment link!');
      return false;
    }

    // Check if document is provided (required)
    if (!project.document) {
      toast.error('Document file is required!');
      return false;
    }

    // Validate file types
    if (project.previewImage && !project.previewImage.type.startsWith('image/')) {
      toast.error('Preview image must be an image file!');
      return false;
    }

    const allowedDocTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (project.document && !allowedDocTypes.includes(project.document.type)) {
      toast.error('Document must be a PDF, DOC, DOCX, or TXT file!');
      return false;
    }

    if (project.video && !project.video.type.startsWith('video/')) {
      toast.error('Video must be a video file!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('batchNumber', project.batchNumber);
    formData.append('teamNumber', project.teamNumber);
    formData.append('name', project.name);
    formData.append('description', project.description);
    formData.append('githubLink', project.githubLink);
    formData.append('deploymentLink', project.deploymentLink);
    formData.append('developer', project.developer);
    
    if (project.previewImage) {
      formData.append('previewImage', project.previewImage);
    }
    
    if (project.document) {
      formData.append('document', project.document);
    }
    
    if (project.video) {
      formData.append('video', project.video);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/projects/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Project added successfully!');
      
      // Reset form
      setProject({
        batchNumber: '',
        teamNumber: '',
        name: '',
        description: '',
        githubLink: '',
        deploymentLink: '',
        developer: '',
        previewImage: null,
        document: null,
        video: null
      });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      console.error('Error adding project:', error);
      const errorMessage = error.response?.data?.message || 'Error adding project!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Define inline styles
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '70px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const textareaStyle = {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    minHeight: '100px',
  };

  const fileInputStyle = {
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  };

  const buttonStyle = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: loading ? '#6c757d' : '#007bff',
    color: '#fff',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const labelStyle = {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  };

  const requiredStyle = {
    color: '#dc3545',
  };

  const sectionStyle = {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  };

  const sectionTitleStyle = {
    margin: '0 0 15px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '600',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '8px',
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Add New Project
        </h2>

        {/* Basic Information Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>📋 Basic Information</h3>
          
          <label style={labelStyle}>
            Batch Number <span style={requiredStyle}>*</span>
          </label>
          <input
            type="text"
            name="batchNumber"
            placeholder="e.g., Batch-2024-01"
            value={project.batchNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Team Number <span style={requiredStyle}>*</span>
          </label>
          <input
            type="number"
            name="teamNumber"
            placeholder="e.g., 1"
            value={project.teamNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Project Name <span style={requiredStyle}>*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter project name"
            value={project.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Developer <span style={requiredStyle}>*</span>
          </label>
          <input
            type="text"
            name="developer"
            placeholder="Developer name(s)"
            value={project.developer}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Project Description <span style={requiredStyle}>*</span>
          </label>
          <textarea
            name="description"
            placeholder="Describe your project in detail..."
            value={project.description}
            onChange={handleChange}
            required
            style={textareaStyle}
          ></textarea>
        </div>

        {/* Links Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>🔗 Project Links</h3>
          
          <label style={labelStyle}>
            GitHub Repository Link <span style={requiredStyle}>*</span>
          </label>
          <input
            type="url"
            name="githubLink"
            placeholder="https://github.com/username/repository"
            value={project.githubLink}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Deployment/Live Demo Link <span style={requiredStyle}>*</span>
          </label>
          <input
            type="url"
            name="deploymentLink"
            placeholder="https://your-project-demo.com"
            value={project.deploymentLink}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Files Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>📁 Project Files</h3>
          
          <label style={labelStyle}>
            Preview Image (Optional)
          </label>
          <input
            type="file"
            name="previewImage"
            accept="image/*"
            onChange={handleFileChange}
            style={fileInputStyle}
          />
          <small style={{ color: '#6c757d', fontSize: '12px', marginBottom: '15px', display: 'block' }}>
            Supported formats: JPG, PNG, GIF, WEBP
          </small>

          <label style={labelStyle}>
            Project Document <span style={requiredStyle}>*</span>
          </label>
          <input
            type="file"
            name="document"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            required
            style={fileInputStyle}
          />
          <small style={{ color: '#6c757d', fontSize: '12px', marginBottom: '15px', display: 'block' }}>
            Supported formats: PDF, DOC, DOCX, TXT
          </small>

          <label style={labelStyle}>
            Project Video (Optional)
          </label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            style={fileInputStyle}
          />
          <small style={{ color: '#6c757d', fontSize: '12px', marginBottom: '15px', display: 'block' }}>
            Supported formats: MP4, AVI, MOV, WEBM, etc.
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Adding Project...
            </>
          ) : (
            'Add Project'
          )}
        </button>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </>
  );
};

export default AddProject;