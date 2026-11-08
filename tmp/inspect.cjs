const fs = require('fs');
const code = fs.readFileSync('/tmp/safar/app.js', 'utf8');

console.log('--- Searching for navigation / state ---');
const regexList = [
  /tabs?\s*[:=]\s*(\[[^\]]+\])/gi,
  /routes?\s*[:=]\s*(\[[^\]]+\])/gi,
  /drivers?\s*[:=]\s*(\[[^\]]+\])/gi,
  /emergency\w*\s*[:=]\s*(\[[^\]]+\])/gi,
];

// Let's find react components or section names
const sections = code.match(/["'](?:home|drivers|emergency|fare|fareCalculator|calculator|booking|profile|settings|admin|history|routes|live|map|guide|notice|prayer|mosque|hospital|ambulance|police|fire|cng|auto|bike|rickshaw)["']/gi);
console.log('Matched section keywords:', [...new Set(sections)]);

// Find all bangla phrases with more than 5 chars
const bnPhrases = [...new Set(code.match(/[\u0980-\u09FF\s]{5,40}/g) || [])];
console.log('Sample Bangla phrases count:', bnPhrases.length);
fs.writeFileSync('/tmp/bnPhrases.txt', bnPhrases.join('\n'));

// Let's inspect data structures
const matchData = code.match(/\[\s*\{[^}]*id:[^}]*name:[^}]*\}\s*\]/g);
console.log('Object array samples:', matchData ? matchData.length : 0);
