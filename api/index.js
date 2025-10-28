const express = require('express');
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// A simple GET route
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from Vercel Express Serverless Function!' });
});

// Important: Export the Express app instance
module.exports = app;