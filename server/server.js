const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'face_detection'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Endpoint to fetch person details by name
app.get('/api/getPersonDetails', (req, res) => {
  const { name } = req.query;
  const sql = 'SELECT * FROM data WHERE Name = ?';
  console.log("Nameee",name);

  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error fetching person details:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send('Person not found');
      }
    }
  });
});

// POST endpoint for detecting faces
app.post('/api/detect', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO detected_faces (name) VALUES (?)';
  
  db.query(sql, [name], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(result);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
