const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InternshipBatch = require('../models/intership');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ======================
// BATCH OPERATIONS
// ======================

// CREATE - Create a new internship batch
router.post('/batches', async (req, res) => {
  try {
    const { batchNumber, internships = [] } = req.body;
    
    const newBatch = new InternshipBatch({
      batchNumber,
      internships
    });
    
    const savedBatch = await newBatch.save();
    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: savedBatch
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Batch number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
});

// READ - Get all batches
router.get('/batches', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const batches = await InternshipBatch.find()
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await InternshipBatch.countDocuments();
    
    res.json({
      success: true,
      data: batches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBatches: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
});

// READ - Get batch by batch number
router.get('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    
    const batch = await InternshipBatch.findOne({ batchNumber });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message
    });
  }
});

// UPDATE - Update batch (batch number cannot be changed)
router.put('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const updateData = { ...req.body };
    
    // Prevent batchNumber modifications
    delete updateData.batchNumber;
    
    const updatedBatch = await InternshipBatch.findOneAndUpdate(
      { batchNumber },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBatch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message
    });
  }
});

// DELETE - Delete batch
router.delete('/batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    
    const deletedBatch = await InternshipBatch.findOneAndDelete({
      batchNumber
    });
    
    if (!deletedBatch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Batch deleted successfully',
      data: deletedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
});

// ======================
// INTERNSHIP OPERATIONS (within batches)
// ======================

// CREATE - Add internship to a batch
router.post(
  '/batches/:batchNumber/internships',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { batchNumber } = req.params;
      const {
        name,
        rollNo,
        internshipTitle,
        company,
        duration,
        description
      } = req.body;

      let image = null;
      let certificate = null;
      if (req.files?.image) {
        image = {
          data: req.files.image[0].buffer,
          originalName: req.files.image[0].originalname,
          mimetype: req.files.image[0].mimetype,
          size: req.files.image[0].size
        };
      }
      if (req.files?.certificate) {
        certificate = {
          data: req.files.certificate[0].buffer,
          originalName: req.files.certificate[0].originalname,
          mimetype: req.files.certificate[0].mimetype,
          size: req.files.certificate[0].size
        };
      }

      const internshipData = {
        name,
        rollNo,
        internshipTitle,
        company,
        duration,
        description,
        image,
        certificate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const batch = await InternshipBatch.findOneAndUpdate(
        { batchNumber },
        { $push: { internships: internshipData } },
        { new: true, runValidators: true }
      );

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const addedInternship = batch.internships[batch.internships.length - 1];

      res.status(201).json({
        success: true,
        message: 'Internship added successfully',
        data: addedInternship
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding internship',
        error: error.message
      });
    }
  }
);

// READ - Get all internships in a batch
router.get('/batches/:batchNumber/internships', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const batch = await InternshipBatch.findOne({ batchNumber });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const internships = batch.internships.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: internships,
      pagination: {
        currentPage: parseInt(page),
        totalInternships: batch.internships.length,
        totalPages: Math.ceil(batch.internships.length / limit),
        hasNext: endIndex < batch.internships.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching internships',
      error: error.message
    });
  }
});

// READ - Get specific internship by ID
router.get('/batches/:batchNumber/internships/:internshipId', async (req, res) => {
  try {
    const { batchNumber, internshipId } = req.params;
    
    const batch = await InternshipBatch.findOne({ batchNumber });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const internship = batch.internships.id(internshipId);
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    
    res.json({
      success: true,
      data: internship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching internship',
      error: error.message
    });
  }
});

// UPDATE - Update specific internship
router.put(
  '/batches/:batchNumber/internships/:internshipId',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { batchNumber, internshipId } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      if (req.files?.image) {
        updateData.image = {
          data: req.files.image[0].buffer,
          originalName: req.files.image[0].originalname,
          mimetype: req.files.image[0].mimetype,
          size: req.files.image[0].size
        };
      }
      if (req.files?.certificate) {
        updateData.certificate = {
          data: req.files.certificate[0].buffer,
          originalName: req.files.certificate[0].originalname,
          mimetype: req.files.certificate[0].mimetype,
          size: req.files.certificate[0].size
        };
      }

      const batch = await InternshipBatch.findOne({ batchNumber });
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const internship = batch.internships.id(internshipId);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      Object.keys(updateData).forEach(key => {
        internship[key] = updateData[key];
      });

      await batch.save();

      res.json({
        success: true,
        message: 'Internship updated successfully',
        data: internship
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating internship',
        error: error.message
      });
    }
  }
);

// GET image file for internship
router.get('/batches/:batchNumber/internships/:internshipId/image', async (req, res) => {
  try {
    const { batchNumber, internshipId } = req.params;
    const batch = await InternshipBatch.findOne({ batchNumber });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const internship = batch.internships.id(internshipId);
    if (!internship || !internship.image || !internship.image.data) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.set('Content-Type', internship.image.mimetype);
    res.send(internship.image.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving image', error: error.message });
  }
});

// GET certificate file for internship
router.get('/batches/:batchNumber/internships/:internshipId/certificate', async (req, res) => {
  try {
    const { batchNumber, internshipId } = req.params;
    const batch = await InternshipBatch.findOne({ batchNumber });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const internship = batch.internships.id(internshipId);
    if (!internship || !internship.certificate || !internship.certificate.data) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.set('Content-Type', internship.certificate.mimetype);
    res.set('Content-Disposition', `attachment; filename="${internship.certificate.originalName}"`);
    res.send(internship.certificate.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving certificate', error: error.message });
  }
});

// DELETE - Delete specific internship (MOVED outside any other route handlers)
router.delete('/batches/:batchNumber/internships/:internshipId', async (req, res) => {
  try {
    const { batchNumber, internshipId } = req.params;

    const batch = await InternshipBatch.findOne({ batchNumber });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const internship = batch.internships.id(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Remove the internship subdocument
    // For Mongoose >= 5.6, use deleteOne; fallback to filter for older versions
    if (typeof internship.deleteOne === 'function') {
      internship.deleteOne();
    } else {
      batch.internships = batch.internships.filter(i => i._id.toString() !== internshipId);
    }

    await batch.save();

    res.json({
      success: true,
      message: 'Internship deleted successfully',
      data: internship
    });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting internship',
      error: error.message
    });
  }
});

// ======================
// UTILITY OPERATIONS
// ======================

// Search internships across all batches
router.get('/search/internships', async (req, res) => {
  try {
    const { name, rollNo, internshipTitle, batchNumber } = req.query;
    
    let matchConditions = {};
    
    if (batchNumber) {
      matchConditions.batchNumber = batchNumber; // no parseInt
    }
    
    let internshipMatch = {};
    if (name) internshipMatch['internships.name'] = new RegExp(name, 'i');
    if (rollNo) internshipMatch['internships.rollNo'] = new RegExp(rollNo, 'i');
    if (internshipTitle) internshipMatch['internships.internshipTitle'] = new RegExp(internshipTitle, 'i');
    
    const batches = await InternshipBatch.aggregate([
      { $match: matchConditions },
      { $unwind: '$internships' },
      { $match: internshipMatch },
      {
        $project: {
          batchNumber: 1,
          internship: '$internships',
          batchCreatedAt: '$createdAt'
        }
      },
      { $sort: { 'internship.createdAt': -1 } }
    ]);
    
    res.json({
      success: true,
      data: batches,
      count: batches.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching internships',
      error: error.message
    });
  }
});

// Get batch statistics
router.get('/batches/:batchNumber/stats', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    
    const batch = await InternshipBatch.findOne({ batchNumber });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const stats = {
      batchNumber: batch.batchNumber,
      totalInternships: batch.internships.length,
      internshipsWithImages: batch.internships.filter(i => i.image && i.image.data).length,
      internshipsWithCertificates: batch.internships.filter(i => i.certificate && i.certificate.data).length,
      uniqueInternshipTitles: [...new Set(batch.internships.map(i => i.internshipTitle))].length,
      createdAt: batch.createdAt,
      lastUpdated: batch.internships.length === 0 ? batch.createdAt : new Date(Math.max(...batch.internships.map(i => new Date(i.updatedAt).getTime())))
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching batch statistics',
      error: error.message
    });
  }
});

module.exports = router;