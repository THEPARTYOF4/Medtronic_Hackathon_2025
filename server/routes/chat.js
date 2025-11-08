const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const chatSchema = require('../schemas/chat.request.json');
const { spawn } = require('child_process');
const path = require('path');

// GET /api/chat
// Returns chat history with query parameter support
router.get('/', async (req, res) => {
  try {
    // Spawn Python process with chat mode
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    const python = spawn('python', [pythonScript, '--mode', 'chat']);
    
    // Send query parameters as request
    const queryData = {
      prompt: req.query.q || 'List recent medical conversations',
      metadata: {
        type: 'medical',
        searchGlossary: true,
        limit: parseInt(req.query.limit) || 10
      }
    };
    
    python.stdin.write(JSON.stringify(queryData));
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
    console.error('Error fetching chat history:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch chat history',
      details: err.message
    });
  }
});

// POST /api/chat
// Handles chat requests and integrates with Python AI service
router.post('/', validateBody(chatSchema), async (req, res) => {
  try {
    // Spawn Python process
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    const python = spawn('python', [pythonScript]);
    
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
