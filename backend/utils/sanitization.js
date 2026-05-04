const xss = require('xss');

// Input sanitization utilities
const sanitizeInput = {
  // Basic text sanitization
  text: (input) => {
    if (typeof input !== 'string') return input;
    return xss(input.trim());
  },

  // Email sanitization (basic)
  email: (email) => {
    if (typeof email !== 'string' || email === null || email === undefined) {
      return '';
    }
    return email.trim().toLowerCase();
  },

  // Numeric sanitization
  number: (input) => {
    const num = Number(input);
    return isNaN(num) ? 0 : num;
  },

  // Price sanitization (ensure positive)
  price: (input) => {
    const num = Number(input);
    return isNaN(num) || num <= 0 ? 0 : Math.round(num * 100) / 100; // Round to 2 decimal places
  },

  // Length-limited text
  textWithLimit: (input, maxLength = 255) => {
    if (typeof input !== 'string' || input === null || input === undefined) {
      return '';
    }
    return xss(input.trim()).substring(0, maxLength);
  },

  // Sanitize object recursively
  object: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput.text(value);
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeInput.object(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};

module.exports = sanitizeInput;