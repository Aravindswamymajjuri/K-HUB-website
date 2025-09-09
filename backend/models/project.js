const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  batchNumber: { type: String, required: true },
  teamNumber: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  githubLink: { type: String, required: true },
  deploymentLink: { type: String, required: true },
  developer: { type: String, required: true },
  previewImage: { type: Buffer, default: null },
  previewImageType: { type: String, default: null },
  document: {
    data: { type: Buffer, required: false, default: null },
    contentType: { type: String, required: false, default: null },
    filename: { type: String, required: false, default: null }
  },
  video: {
    data: { type: Buffer, required: false, default: null },
    contentType: { type: String, required: false, default: null },
    filename: { type: String, required: false, default: null }
  }
});

module.exports = mongoose.model('Project', projectSchema);