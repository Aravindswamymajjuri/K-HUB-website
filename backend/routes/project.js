const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const multer = require('multer');

// Multer setup for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 3 // Maximum 3 files total
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and videos
    if (file.fieldname === 'previewImage' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (file.fieldname === 'document' && (
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    )) {
      cb(null, true);
    } else if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`), false);
    }
  }
});

// Helper function to validate buffer size
const validateBufferSize = (buffer, filename, maxSize = 10 * 1024 * 1024) => {
  if (buffer && buffer.length > maxSize) {
    throw new Error(`File ${filename} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
  }
  return true;
};

// Route to add a new project
router.post('/add', upload.fields([
  { name: 'previewImage', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  const { batchNumber, teamNumber, name, description, githubLink, deploymentLink, developer } = req.body;
  
  if (!batchNumber || !teamNumber || !name || !description || !githubLink || !deploymentLink || !developer) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }
  
  if (!/^https?:\/\/.+/.test(githubLink)) {
    return res.status(400).json({ success: false, message: 'Invalid GitHub link.' });
  }
  
  if (!/^https?:\/\/.+/.test(deploymentLink)) {
    return res.status(400).json({ success: false, message: 'Invalid deployment link.' });
  }

  // Check if document is provided (required)
  if (!req.files || !req.files.document || req.files.document.length === 0) {
    return res.status(400).json({ success: false, message: 'Document file is required.' });
  }

  try {
    // Validate file sizes before processing
    const previewImageFile = req.files.previewImage ? req.files.previewImage[0] : null;
    const documentFile = req.files.document[0];
    const videoFile = req.files.video ? req.files.video[0] : null;

    // Check individual file sizes
    if (previewImageFile) {
      validateBufferSize(previewImageFile.buffer, previewImageFile.originalname, 5 * 1024 * 1024); // 5MB for images
    }
    
    if (documentFile) {
      validateBufferSize(documentFile.buffer, documentFile.originalname, 10 * 1024 * 1024); // 10MB for documents
    }
    
    if (videoFile) {
      validateBufferSize(videoFile.buffer, videoFile.originalname, 15 * 1024 * 1024); // 15MB for videos
    }

    // Calculate total document size to ensure it's under MongoDB's 16MB limit
    let totalSize = 0;
    if (previewImageFile) totalSize += previewImageFile.buffer.length;
    if (documentFile) totalSize += documentFile.buffer.length;
    if (videoFile) totalSize += videoFile.buffer.length;
    
    // Add some overhead for other fields (1MB buffer)
    if (totalSize > 15 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'Total file size exceeds 15MB limit. Please reduce file sizes.' 
      });
    }

    // Create the project document
    const projectData = {
      batchNumber,
      teamNumber,
      name,
      description,
      githubLink,
      deploymentLink,
      developer,
      previewImage: previewImageFile ? previewImageFile.buffer : null,
      previewImageType: previewImageFile ? previewImageFile.mimetype : null,
      document: {
        data: documentFile ? documentFile.buffer : null,
        contentType: documentFile ? documentFile.mimetype : null,
        filename: documentFile ? documentFile.originalname : null
      },
      video: videoFile ? {
        data: videoFile.buffer,
        contentType: videoFile.mimetype,
        filename: videoFile.originalname
      } : { data: null, contentType: null, filename: null }
    };

    const newProject = new Project(projectData);
    await newProject.save();
    
    res.status(201).json({ success: true, message: 'Project added successfully' });
  } catch (error) {
    console.error('Error adding project:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size too large. Maximum allowed size is 10MB per file.' 
      });
    }
    
    // Handle buffer size validation errors
    if (error.message.includes('exceeds maximum size')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to add project', details: error.message });
  }
});

// Add error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 3 files total.'
      });
    }
  }
  next(error);
});

// Route to fetch projects based on batchNumber and teamNumber
router.get('/', async (req, res) => {
  const { batchNumber, teamNumber } = req.query;

  try {
    let query = {};

    if (batchNumber) {
      query.batchNumber = batchNumber;
    }

    if (teamNumber) {
      query.teamNumber = teamNumber;
    }

    const projects = await Project.find(query);

    const projectsWithFiles = projects.map(project => {
      const projectObj = project.toObject();
      
      // Convert preview image to base64 if exists
      if (project.previewImage && project.previewImageType) {
        projectObj.previewImage = project.previewImage.toString('base64');
      }
      
      // Convert document to base64
      if (project.document && project.document.data) {
        projectObj.document = {
          ...projectObj.document,
          data: project.document.data.toString('base64')
        };
      }
      
      // Convert video to base64 if exists
      if (project.video && project.video.data) {
        projectObj.video = {
          ...projectObj.video,
          data: project.video.data.toString('base64')
        };
      }
      
      return projectObj;
    });

    res.json(projectsWithFiles);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send('Failed to fetch projects');
  }
});

// Route to fetch all distinct batch numbers
router.get('/batch-numbers', async (req, res) => {
  try {
    const batchNumbers = await Project.distinct('batchNumber');
    res.json(batchNumbers);
  } catch (error) {
    console.error('Error fetching batch numbers:', error);
    res.status(500).send('Failed to fetch batch numbers');
  }
});

// Route to fetch all distinct team numbers
router.get('/team-numbers', async (req, res) => {
  try {
    const teamNumbers = await Project.distinct('teamNumber');
    res.json(teamNumbers);
  } catch (error) {
    console.error('Error fetching team numbers:', error);
    res.status(500).send('Failed to fetch team numbers');
  }
});

// Route to download document
router.get('/:id/document', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.document || !project.document.data) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.set({
      'Content-Type': project.document.contentType,
      'Content-Disposition': `attachment; filename="${project.document.filename}"`
    });
    
    res.send(project.document.data);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Route to download video
router.get('/:id/video', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.video || !project.video.data) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.set({
      'Content-Type': project.video.contentType,
      'Content-Disposition': `attachment; filename="${project.video.filename}"`
    });
    
    res.send(project.video.data);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

// Route to update a project
router.put('/:id', upload.fields([
  { name: 'previewImage', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  const { name, description, githubLink, deploymentLink, developer } = req.body;
  
  if (!name || !description || !githubLink || !deploymentLink || !developer) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }
  
  if (!/^https?:\/\/.+/.test(githubLink)) {
    return res.status(400).json({ success: false, message: 'Invalid GitHub link.' });
  }
  
  if (!/^https?:\/\/.+/.test(deploymentLink)) {
    return res.status(400).json({ success: false, message: 'Invalid deployment link.' });
  }

  try {
    const updateData = {
      name,
      description,
      githubLink,
      deploymentLink,
      developer
    };

    // Update preview image if provided
    if (req.files && req.files.previewImage) {
      const previewImageFile = req.files.previewImage[0];
      validateBufferSize(previewImageFile.buffer, previewImageFile.originalname, 5 * 1024 * 1024);
      updateData.previewImage = previewImageFile.buffer;
      updateData.previewImageType = previewImageFile.mimetype;
    }

    // Update document if provided
    if (req.files && req.files.document) {
      const documentFile = req.files.document[0];
      validateBufferSize(documentFile.buffer, documentFile.originalname, 10 * 1024 * 1024);
      updateData.document = {
        data: documentFile.buffer,
        contentType: documentFile.mimetype,
        filename: documentFile.originalname
      };
    }

    // Update video if provided
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      validateBufferSize(videoFile.buffer, videoFile.originalname, 15 * 1024 * 1024);
      updateData.video = {
        data: videoFile.buffer,
        contentType: videoFile.mimetype,
        filename: videoFile.originalname
      };
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true, message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error.message.includes('exceeds maximum size')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to update project', details: error.message });
  }
});

// Route to delete a project
router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project', details: error.message });
  }
});

module.exports = router;