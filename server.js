
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Show the website homepage
app.use(express.static(path.join(__dirname, 'public')));

// Temporary empty file list
app.get('/api/files', (req, res) => {
  res.json([]);
});

// Keep uploads disabled until secure storage is ready
app.post('/api/upload', (req, res) => {
  res.status(503).json({
    error: 'Uploads are temporarily disabled while secure storage is configured.'
  });
});

app.listen(PORT, () => {
  console.log(`Website running on port ${PORT}`);
});
