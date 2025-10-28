const express = require('express');
const app = express();

// --- Middleware ---
app.use(express.json());

// Log the start of the application (this runs during Vercel's initialization/cold start)
console.log('--- Express Serverless Function Initializing ---');

// --- Routes ---

// 1. Logging on a simple GET request
app.get('/api/hello', (req, res) => {
  // Simple success log
  console.log('✅ INFO: Received GET request for /api/hello');

  // Log specific request details
  const userAgent = req.headers['user-agent'];
  console.log(`📡 Request from User-Agent: ${userAgent}`);

  res.status(200).json({ message: 'Hello from Vercel Express Serverless Function!' });
});

// 2. Logging on a POST request (simulating data handling)
app.post('/api/data', (req, res) => {
  const incomingData = req.body;

  // Log the received data (use console.warn for important data logs)
  console.warn('⚠️ WARNING: Received new data payload.');
  console.log('Payload:', incomingData);
  
  // Basic validation and response
  if (!incomingData || Object.keys(incomingData).length === 0) {
    console.error('❌ ERROR: Empty payload received.');
    return res.status(400).json({ error: 'Request body cannot be empty.' });
  }

  // Respond to client
  res.status(201).json({ 
    message: 'Data processed successfully!', 
    received: incomingData 
  });
});


// 3. Fallback/Wildcard Route Logging (for 404s)
// This should be the last route.
app.use((req, res) => {
    // Log any request that didn't match a defined route
    console.log(`❓ NOT FOUND: Request to path: ${req.originalUrl}`);
    res.status(404).send('404 - API Endpoint Not Found');
});


// --- Export ---
// Important: Export the app instance for Vercel's serverless runtime
module.exports = app;