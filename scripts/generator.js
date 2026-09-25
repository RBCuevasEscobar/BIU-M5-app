const fs = require('fs');
const path = require('path');
const base = path.resolve('backend/src/main/java/mx/iqenglish/tutoring');

function write(relPath, content) {
    const full = path.join(base, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content.trim() + '\n', 'utf8');
}

// Export helper
module.exports = { write, base };
