// Import API key from Python file and export for JavaScript use
const fs = require('fs');
const path = require('path');

// Read and parse the Python API_KEY file
const apiKeyFile = path.join(__dirname, 'API_KEY.py');
const apiKeyContent = fs.readFileSync(apiKeyFile, 'utf8');

// Extract API key using regex
const apiKeyMatch = apiKeyContent.match(/API_KEY\s*=\s*["']([^"']+)["']/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : '';

// Export the API key
module.exports = {
    API_KEY,
    // Maintain backwards compatibility
    GEMINI_API_KEY: API_KEY,
    MAPS_API_KEY: API_KEY
};