const express = require('express');
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "face_detection",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `src/assets/labeled_images/${req.body.name}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const dir = `src/assets/labeled_images/${req.body.name}`;
    fs.readdir(dir, (err, files) => {
      if (err) {
        cb(err);
      } else {
        // Filter out only jpg files and get the highest number
        const fileNumbers = files
          .filter((file) => file.endsWith(".jpg"))
          .map((file) => parseInt(file.split(".jpg")[0]))
          .filter((num) => !isNaN(num))
          .sort((a, b) => a - b);

        const nextNumber =
          fileNumbers.length > 0 ? fileNumbers[fileNumbers.length - 1] + 1 : 1;
        cb(null, `${nextNumber}.jpg`);
      }
    });
  },
});

const upload = multer({ storage: storage });

// Endpoint to fetch person details by name
app.get("/api/getPersonDetails", (req, res) => {
  const { name } = req.query;
  const sql = "SELECT * FROM data WHERE Name = ?";

  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("Error fetching person details:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send("Person not found");
      }
    }
  });
});

// POST endpoint for detecting faces
app.post("/api/detect", (req, res) => {
  const { name } = req.body;
  const sql = "INSERT INTO detected_faces (name) VALUES (?)";

  db.query(sql, [name], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(result);
  });
});

// POST endpoint to upload images
app.post("/api/upload", upload.array("images", 12), (req, res) => {
  res.send("Images uploaded successfully.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
