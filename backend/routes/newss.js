const express = require('express');
const router = express.Router();
const multer = require('multer');
const News = require('../models/news');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  }
});

// Create news with optional image and PDF upload
router.post('/news', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.body.items) {
      return res.status(400).json({ message: 'No items data received' });
    }

    let items;
    try {
      items = JSON.parse(req.body.items);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid items data', error: parseError.toString() });
    }

    // Handle image placeholder replacement
    if (req.files && req.files.image) {
      const imageFile = req.files.image[0];
      const imageIndex = items.findIndex(item => item.value === 'IMAGE_PLACEHOLDER');
      if (imageIndex !== -1) {
        const base64Image = imageFile.buffer.toString('base64');
        items[imageIndex].value = `data:${imageFile.mimetype};base64,${base64Image}`;
      }
    }

    // Handle optional PDF file
    let pdfData = null;
    if (req.files && req.files.pdfFile) {
      const pdfFile = req.files.pdfFile[0];
      pdfData = {
        data: pdfFile.buffer,
        contentType: pdfFile.mimetype,
        fileName: pdfFile.originalname
      };
    }

    const news = new News({ items, pdf: pdfData });
    await news.save();

    res.status(201).json({ message: 'News items saved successfully', news });
  } catch (error) {
    console.error('Error saving news items:', error);
    res.status(500).json({ message: 'Failed to save news items', error: error.toString() });
  }
});

// Get all news
router.get('/api/news', async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
    res.status(200).json(allNews);
  } catch (error) {
    console.error('Error retrieving news items:', error);
    res.status(500).json({ message: 'Failed to retrieve news items' });
  }
});

// Get specific news by id
router.get('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.status(200).json(news);
  } catch (error) {
    console.error('Error retrieving news item:', error);
    res.status(500).json({ message: 'Failed to retrieve news item' });
  }
});

// Route to serve PDF file for a specific news item
router.get('/api/news/:id/pdf', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news || !news.pdf || !news.pdf.data) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    res.contentType(news.pdf.contentType);
    res.set('Content-Disposition', `attachment; filename="${news.pdf.fileName}"`);
    res.send(news.pdf.data);
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    res.status(500).json({ message: 'Failed to retrieve PDF' });
  }
});

// Update news with optional new image and PDF
router.put('/api/news/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;

    let updatedItems;
    if (typeof req.body.items === 'string') {
      try {
        updatedItems = JSON.parse(req.body.items);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid items data', error: parseError.toString() });
      }
    } else if (Array.isArray(req.body.items)) {
      updatedItems = req.body.items;
    } else {
      return res.status(400).json({ message: 'Invalid items data format' });
    }

    // Handle image update
    if (req.files && req.files.image) {
      const imageFile = req.files.image[0];
      const imageIndex = updatedItems.findIndex(item => item.type === 'image');
      if (imageIndex !== -1) {
        const base64Image = imageFile.buffer.toString('base64');
        updatedItems[imageIndex].value = `data:${imageFile.mimetype};base64,${base64Image}`;
      }
    }

    // Handle PDF update
    let pdfData = undefined;
    if (req.files && req.files.pdfFile) {
      const pdfFile = req.files.pdfFile[0];
      pdfData = {
        data: pdfFile.buffer,
        contentType: pdfFile.mimetype,
        fileName: pdfFile.originalname
      };
    }

    // Build update object
    const updateObj = { items: updatedItems };
    if (pdfData !== undefined) {
      updateObj.pdf = pdfData;
    }

    const updatedNews = await News.findByIdAndUpdate(id, updateObj, { new: true });

    if (!updatedNews) {
      return res.status(404).json({ message: 'News item not found' });
    }

    res.status(200).json(updatedNews);
  } catch (error) {
    console.error('Error updating news item:', error);
    res.status(500).json({ message: 'Failed to update news item', error: error.toString() });
  }
});

// Delete news
router.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return res.status(404).json({ message: 'News item not found' });
    }

    res.status(200).json({ message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news item:', error);
    res.status(500).json({ message: 'Failed to delete news item', error: error.toString() });
  }
});

router.get('/api/news/:id/pdf', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news || !news.pdf || !news.pdf.data) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.contentType(news.pdf.contentType || 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="' + (news.pdf.fileName || 'newsletter.pdf') + '"');
    res.send(news.pdf.data);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ message: 'Failed to retrieve PDF' });
  }
});


module.exports = router;
