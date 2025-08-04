const mongoose = require('mongoose');

const newsItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['title', 'subtitle', 'image', 'matter'],
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

const newsSchema = new mongoose.Schema({
  items: [newsItemSchema],

  // PDF storage fields
  pdf: {
    data: Buffer,
    contentType: String,
    fileName: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
