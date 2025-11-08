const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const locationSchema = require('../schemas/location.request.json');
const { spawn } = require('child_process');
const path = require('path');
const { API_KEY } = require('../API_KEY');

// POST /api/locations/search
// Handles location search requests for Google Maps integration
router.post('/search', validateBody(locationSchema), async (req, res) => {
  try {
    // Spawn Python process
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    const python = spawn('python', [pythonScript, '--mode', 'locations']);
    
    // Send request data to Python process
    python.stdin.write(JSON.stringify(req.body));
    python.stdin.end();

    let result = '';
    let error = '';

    // Collect data from Python process
    python.stdout.on('data', (data) => {
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Handle completion or error
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', error);
        return res.status(500).json({ 
          error: 'Error processing request',
          details: error
        });
      }

      try {
        const response = JSON.parse(result);
        return res.json(response);
      } catch (e) {
        console.error('Error parsing Python response:', e);
        return res.status(500).json({ 
          error: 'Invalid response format',
          details: e.message 
        });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
});

// GET /api/locations/embed/:id
// Returns the embed HTML for a specific map
router.get('/embed/:id', (req, res) => {
  const { id } = req.params;
  const { q, zoom, region, hl } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Missing query parameter'
    });
  }

  // Construct the Google Maps Embed API URL
  const baseUrl = 'https://www.google.com/maps/embed/v1/search';
  const key = API_KEY;
  
  // Build query parameters
  const params = new URLSearchParams({
    key,
    q,
    zoom: zoom || 13,
    region: region || 'US',
    language: hl || 'en'
  });

  // Generate embed HTML
  const embedHtml = `
    <iframe
      width="600"
      height="450"
      style="border:0"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src="${baseUrl}?${params.toString()}">
    </iframe>
  `.trim();

  res.json({ id, embedHtml });
});

module.exports = router;