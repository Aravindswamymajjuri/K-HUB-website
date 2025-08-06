const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  },
  internshipTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    data: {
      type: Buffer // Store as binary buffer
      // required: true // Remove required if you want optional uploads
    },
    originalName: String,
    mimetype: String,
    size: Number
  },
  certificate: {
    data: {
      type: Buffer // Store as binary buffer
      // required: true // Remove required if you want optional uploads
    },
    originalName: String,
    mimetype: String,
    size: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,              // Changed from Number to String
    required: true,
    unique: true,
    index: true,
    match: /^\d{4}-\d{4}$/     // Validates format like "2024-2025"
  },
  internships: [internshipSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InternshipBatch', batchSchema);
