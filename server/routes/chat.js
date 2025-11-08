const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const chatSchema = require('../schemas/chat.request.json');
const { spawn } = require('child_process');
const path = require('path');

// GET /api/chat?q=your_question
// Returns chat response for the given query
router.get('/', async (req, res) => {
  try {
    console.log('Received GET request with query:', req.query);

    // Require a query parameter
    if (!req.query.q) {
      return res.status(400).json({
        error: 'Missing query',
        details: 'The "q" query parameter is required'
      });
    }

    // Spawn Python process with chat mode
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    console.log('Spawning Python process:', pythonScript);
    const python = spawn('python', [pythonScript, '--mode', 'chat']);
    
    // Send query parameters as request in the same format as POST
    const queryData = {
      prompt: req.query.q,
      metadata: {
        type: 'medical',
        searchGlossary: true,
        updateGlossary: true
      }
    };
    
    console.log('Sending data to Python:', JSON.stringify(queryData, null, 2));
    
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
    console.log('Received chat request with body:', JSON.stringify(req.body, null, 2));
    
    if (!req.body || !req.body.prompt) {
      console.error('Missing prompt in request body');
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Prompt is required'
      });
    }

    // Spawn Python process with chat mode
    const pythonScript = path.join(__dirname, '..', 'ai_calls.py');
    console.log('Spawning Python process:', pythonScript);
    const python = spawn('python', [pythonScript, '--mode', 'chat']);
    
    // Send request data to Python process with required format
    const requestData = {
      prompt: req.body.prompt,
      metadata: {
        type: 'medical',
        searchGlossary: true,
        updateGlossary: true,
        ...req.body.metadata
      },
      file: req.body.file
    };
    
    console.log('Sending data to Python:', JSON.stringify(requestData, null, 2));
    
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
    console.error('Server error:', err);
    return res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
});

module.exports = router;
