const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const articleSchema = require('../schemas/article.request.json');
const { spawn } = require('child_process');
const path = require('path');

// GET /api/articles
// Returns relevant medical articles based on query parameters
router.get('/', async (req, res) => {
  try {
    // Spawn Python process with articles mode
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    const python = spawn('python', [pythonScript, '--mode', 'articles']);
    
    // Prepare request with query parameters
    const requestData = {
      topic: req.query.topic || 'latest medical technology',
      metadata: {
        maxResults: parseInt(req.query.limit) || 5,
        sourcePriority: req.query.sources ? req.query.sources.split(',') : ['medical', 'academic', 'news'],
        includeDefinitions: req.query.definitions !== 'false'
      }
    };
    
    python.stdin.write(JSON.stringify(requestData));
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
    console.error('Error fetching articles:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch articles',
      details: err.message
    });
  }
});

// POST /api/articles/recommend
// Handles article recommendation requests
router.post('/recommend', validateBody(articleSchema), async (req, res) => {
  try {
    // Spawn Python process
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    const python = spawn('python', [pythonScript, '--mode', 'articles']);
    
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

module.exports = router;