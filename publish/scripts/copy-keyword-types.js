const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.resolve(PROJECT_ROOT, '..', 'database', 'keyword-types.json');
const DEST_DIR = path.join(PROJECT_ROOT, 'assets');
const DEST_PATH = path.join(DEST_DIR, 'keyword-types.json');

if (!fs.existsSync(SOURCE_PATH)) {
  console.error('Source keyword-types.json not found at', SOURCE_PATH);
  process.exit(1);
}

fs.mkdirSync(DEST_DIR, { recursive: true });
fs.copyFileSync(SOURCE_PATH, DEST_PATH);
console.log(`Copied keyword type definitions to ${DEST_PATH}`);
