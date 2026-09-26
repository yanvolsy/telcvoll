process.env.JWT_SECRET = '1234567890123456789012345678901234';
const assert = require('assert');

// 1. Check syntax and exports of mock-submit.js
const mockSubmit = require('../netlify/functions/mock-submit');
assert(typeof mockSubmit.handler === 'function', 'mock-submit must export handler function');

console.log('✓ mock-submit.js syntax and handler export verified');
