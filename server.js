
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Allowed file types
const allowedTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".txt": "text/plain"
};

// Store file information while the server is running
const fileList = new Map();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, id + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes[ext] !== file.mimetype) {
      return cb(new Error("File type is not allowed."));
    }

    cb(null, true);
  }
});

// Show the website
app.use(express.static(path.join(__dirname, "public")));

// Upload a file
app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Please choose a file."
      });
    }

    const id = path.basename(req.file.filename, path.extname(req.file.filename));

    fileList.set(id, {
      id,
      name: path.basename(req.file.originalname),
      filename: req.file.filename
    });

    res.json({
      message: "Upload successful!"
    });
  });
});

// Show uploaded files
app.get("/api/files", (req, res) => {
  res.json(Array.from(fileList.values()).map(file => ({
    id: file.id,
    name: file.name
  })));
});

// Download a file
app.get("/api/files/:id", (req, res) => {
  const file = fileList.get(req.params.id);

  if (!file) {
    return res.status(404).send("File not found.");
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.download(
    path.join(uploadFolder, file.filename),
    file.name
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Website running on port ${PORT}`);
});
