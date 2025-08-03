const express = require('express');
const multer = require('multer');
const ProjectBatch = require('../models/projectlink'); // Adjust path as needed
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ============== CREATE OPERATIONS ==============

// 1. Create a new batch
router.post('/batches', async (req, res) => {
  try {
    const { batchNumber } = req.body;
    
    // Check if batch already exists
    const existingBatch = await ProjectBatch.findOne({ batchNumber });
    if (existingBatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Batch number already exists' 
      });
    }
    
    const newBatch = new ProjectBatch({
      batchNumber,
      teams: []
    });
    
    const savedBatch = await newBatch.save();
    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: savedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
});

// 2. Add a team project to an existing batch
router.post('/batches/:batchNumber/teams', 
  upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'document', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { batchNumber } = req.params;
      const { teamNumber, title, description, deploymentLink, githubLink } = req.body;
      
      // Validate required files
      if (!req.files?.projectImage || !req.files?.document) {
        return res.status(400).json({
          success: false,
          message: 'Both project image and document are required'
        });
      }
      
      // Find the batch
      const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }
      
      // Check if team already exists in this batch
      const existingTeam = batch.teams.find(team => team.teamNumber === parseInt(teamNumber));
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team number already exists in this batch'
        });
      }
      
      // Create new team project
      const newTeam = {
        teamNumber: parseInt(teamNumber),
        projectImage: {
          data: req.files.projectImage[0].buffer,
          contentType: req.files.projectImage[0].mimetype,
          filename: req.files.projectImage[0].originalname
        },
        document: {
          data: req.files.document[0].buffer,
          contentType: req.files.document[0].mimetype,
          filename: req.files.document[0].originalname
        },
        title,
        description,
        deploymentLink,
        githubLink
      };
      // Add video if provided
      if (req.files?.video && req.files.video[0]) {
        newTeam.video = {
          data: req.files.video[0].buffer,
          contentType: req.files.video[0].mimetype,
          filename: req.files.video[0].originalname
        };
      }
      
      // Add team to batch
      batch.teams.push(newTeam);
      const updatedBatch = await batch.save();
      
      res.status(201).json({
        success: true,
        message: 'Team added to batch successfully',
        data: updatedBatch
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding team to batch',
        error: error.message
      });
    }
  }
);

// ============== READ OPERATIONS ==============

// 3. Get all batches
router.get('/batches', async (req, res) => {
  try {
    const batches = await ProjectBatch.find().select('-teams.projectImage.data -teams.document.data');
    res.status(200).json({
      success: true,
      message: 'Batches retrieved successfully',
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving batches',
      error: error.message
    });
  }
});

// 4. Get a specific batch with all teams
router.get('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) })
      .select('-teams.projectImage.data -teams.document.data');
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Batch retrieved successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving batch',
      error: error.message
    });
  }
});

// 5. Get a specific team from a batch
router.get('/batches/:batchNumber/teams/:teamNumber', async (req, res) => {
  try {
    const { batchNumber, teamNumber } = req.params;
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const team = batch.teams.find(t => t.teamNumber === parseInt(teamNumber));
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found in this batch'
      });
    }
    
    // Return team without file data
    const teamData = {
      ...team.toObject(),
      projectImage: {
        contentType: team.projectImage.contentType,
        filename: team.projectImage.filename
      },
      document: {
        contentType: team.document.contentType,
        filename: team.document.filename
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Team retrieved successfully',
      data: teamData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving team',
      error: error.message
    });
  }
});

// 6. Get project image
router.get('/batches/:batchNumber/teams/:teamNumber/image', async (req, res) => {
  try {
    const { batchNumber, teamNumber } = req.params;
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
    
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    
    const team = batch.teams.find(t => t.teamNumber === parseInt(teamNumber));
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    res.set('Content-Type', team.projectImage.contentType);
    res.send(team.projectImage.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving image',
      error: error.message
    });
  }
});

// 7. Get document
router.get('/batches/:batchNumber/teams/:teamNumber/document', async (req, res) => {
  try {
    const { batchNumber, teamNumber } = req.params;
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
    
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    
    const team = batch.teams.find(t => t.teamNumber === parseInt(teamNumber));
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    res.set('Content-Type', team.document.contentType);
    res.set('Content-Disposition', `attachment; filename="${team.document.filename}"`);
    res.send(team.document.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving document',
      error: error.message
    });
  }
});

// ============== UPDATE OPERATIONS ==============

// 8. Update batch information
router.put('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { newBatchNumber } = req.body;
    
    const batch = await ProjectBatch.findOneAndUpdate(
      { batchNumber: parseInt(batchNumber) },
      { batchNumber: newBatchNumber },
      { new: true }
    ).select('-teams.projectImage.data -teams.document.data');
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message
    });
  }
});

// 9. Update team information
router.put('/batches/:batchNumber/teams/:teamNumber', 
  upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'document', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { batchNumber, teamNumber } = req.params;
      const { title, description, deploymentLink, githubLink } = req.body;
      
      const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }
      
      const teamIndex = batch.teams.findIndex(t => t.teamNumber === parseInt(teamNumber));
      if (teamIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Team not found in this batch'
        });
      }
      
      // Update team fields
      if (title) batch.teams[teamIndex].title = title;
      if (description) batch.teams[teamIndex].description = description;
      if (deploymentLink) batch.teams[teamIndex].deploymentLink = deploymentLink;
      if (githubLink) batch.teams[teamIndex].githubLink = githubLink;
      
      // Update files if provided
      if (req.files?.projectImage) {
        batch.teams[teamIndex].projectImage = {
          data: req.files.projectImage[0].buffer,
          contentType: req.files.projectImage[0].mimetype,
          filename: req.files.projectImage[0].originalname
        };
      }
      
      if (req.files?.document) {
        batch.teams[teamIndex].document = {
          data: req.files.document[0].buffer,
          contentType: req.files.document[0].mimetype,
          filename: req.files.document[0].originalname
        };
      }
      // Update video if provided
      if (req.files?.video) {
        batch.teams[teamIndex].video = {
          data: req.files.video[0].buffer,
          contentType: req.files.video[0].mimetype,
          filename: req.files.video[0].originalname
        };
      }
      
      const updatedBatch = await batch.save();
      
      res.status(200).json({
        success: true,
        message: 'Team updated successfully',
        data: updatedBatch
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating team',
        error: error.message
      });
    }
  }
);

// ============== DELETE OPERATIONS ==============

// 10. Delete a batch
router.delete('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = await ProjectBatch.findOneAndDelete({ batchNumber: parseInt(batchNumber) });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
});

// 11. Delete a team from a batch
router.delete('/batches/:batchNumber/teams/:teamNumber', async (req, res) => {
  try {
    const { batchNumber, teamNumber } = req.params;
    
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const teamIndex = batch.teams.findIndex(t => t.teamNumber === parseInt(teamNumber));
    if (teamIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team not found in this batch'
      });
    }
    
    // Remove team from array
    batch.teams.splice(teamIndex, 1);
    const updatedBatch = await batch.save();
    
    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
      data: updatedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
});

// 8. Get project video (with range support)
router.get('/batches/:batchNumber/teams/:teamNumber/video', async (req, res) => {
  try {
    const { batchNumber, teamNumber } = req.params;
    const batch = await ProjectBatch.findOne({ batchNumber: parseInt(batchNumber) });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    const team = batch.teams.find(t => t.teamNumber === parseInt(teamNumber));
    if (!team || !team.video || !team.video.data) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    // Ensure videoBuffer is a Node.js Buffer (handles MongoDB Binary type)
    let videoBuffer = team.video.data;
    if (videoBuffer && typeof videoBuffer === 'object' && videoBuffer._bsontype === 'Binary' && videoBuffer.buffer) {
      videoBuffer = Buffer.from(videoBuffer.buffer);
    } else if (!(videoBuffer instanceof Buffer)) {
      videoBuffer = Buffer.from(videoBuffer);
    }
    const videoLength = videoBuffer.length;
    const range = req.headers.range;
    const contentType = team.video.contentType || 'video/mp4';
    if (range) {
      // Parse Range header, e.g. 'bytes=0-'
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoLength - 1;
      if (start >= videoLength || end >= videoLength) {
        res.status(416).send('Requested range not satisfiable');
        return;
      }
      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${videoLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${team.video.filename || 'video.mp4'}"`
      });
      res.end(videoBuffer.slice(start, end + 1));
    } else {
      res.writeHead(200, {
        'Content-Length': videoLength,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${team.video.filename || 'video.mp4'}"`
      });
      res.end(videoBuffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving video',
      error: error.message
    });
  }
});

module.exports = router;