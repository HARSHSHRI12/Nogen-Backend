// utils/passwordUtils.js

// Utility to validate password hash format (bcrypt specific)
const validateHash = (hash) => {
    return typeof hash === 'string' && hash.startsWith('$2b$') && hash.length === 60;
  };
  
  module.exports = {
    validateHash
  };
  