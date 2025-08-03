const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  teamNumber: {
    type: Number,
    required: true,
  },
  projectImage: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  document: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  video: {
    data: {
      type: Buffer,
      required: false
    },
    contentType: {
      type: String,
      required: false
    },
    filename: {
      type: String,
      required: false
    }
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  deploymentLink: {
    type: String,
    required: true,
  },
  githubLink: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const projectbatchSchema = new mongoose.Schema({
  batchNumber: {
    type: Number,
    required: true,
    unique: true
  },
  teams: [projectSchema], // Array of team projects within this batch
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProjectBatch', projectbatchSchema);