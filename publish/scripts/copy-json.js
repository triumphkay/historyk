const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(PROJECT_ROOT, '..', 'database');
const DEST_DIR = path.join(PROJECT_ROOT, 'assets');

const FILES_TO_COPY = ['keyword-types.json', 'events.json'];

const ensureFileExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`Required source file not found: ${filePath}`);
    process.exit(1);
  }
};

const main = () => {
  fs.mkdirSync(DEST_DIR, { recursive: true });

  FILES_TO_COPY.forEach((fileName) => {
    const sourcePath = path.join(SOURCE_DIR, fileName);
    const destPath = path.join(DEST_DIR, fileName);

    ensureFileExists(sourcePath);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${fileName} to ${destPath}`);
  });
};

main();
