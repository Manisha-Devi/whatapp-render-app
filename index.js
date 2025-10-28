// index.js

const express = require('express');
const app = express();

// Render sets a PORT environment variable. We use 3000 as a fallback for local development.
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello from Render! This is a Node.js Express app.');
});

app.get('/health', (req, res) => {
    // A simple endpoint to check if the server is running
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});