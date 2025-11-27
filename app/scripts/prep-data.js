const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const requiredFiles = [
  path.join(projectRoot, 'assets', 'db.json'),
  path.join(projectRoot, 'assets', 'keyword-types.json'),
  path.join(projectRoot, 'assets', 'events.json'),
];

const shouldForce = process.env.FORCE_DATA_REFRESH === 'true';
const isMissingFile = requiredFiles.some((filePath) => !fs.existsSync(filePath));

if (shouldForce || isMissingFile) {
  const reason = shouldForce ? 'FORCE_DATA_REFRESH=true' : 'missing cached data';
  console.log(`[prep-data] Regenerating datasets (${reason}).`);
  execSync('npm run sync:data', { stdio: 'inherit' });
} else {
  console.log('[prep-data] Cached datasets found. Skipping data sync. Set FORCE_DATA_REFRESH=true to rebuild.');
}
