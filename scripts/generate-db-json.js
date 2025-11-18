#!/usr/bin/env node
/**
 * Regenerates publish/assets/db.json from database/korean-history.db keywords table.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'database', 'korean-history.db');
const OUTPUT_PATH = path.join(ROOT, 'publish', 'assets', 'db.json');

const KEYWORD_TYPES_PATH = path.join(ROOT, 'database', 'keyword-types.json');
const TYPES_OUTPUT_PATH = path.join(ROOT, 'publish', 'assets', 'keyword-types.json');

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [parsed];
    } catch (error) {
      return [trimmed];
    }
  }
  return [value];
};

const main = () => {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found at', DB_PATH);
    process.exit(1);
  }

  let raw;
  try {
    raw = execSync(
      `sqlite3 -json ${JSON.stringify(DB_PATH)} "SELECT id, keyword, descriptions, ref_id, q_ref_id, types, score FROM keywords"`,
      { encoding: 'utf8' }
    );
  } catch (error) {
    console.error('Failed to execute sqlite3:', error.message);
    process.exit(1);
  }

  const rows = JSON.parse(raw || '[]');
  const formatted = rows.map((row) => ({
    id: row.id,
    keyword: row.keyword,
    descriptions: ensureArray(row.descriptions),
    ref_id: ensureArray(row.ref_id),
    q_ref_id: ensureArray(row.q_ref_id),
    types: ensureArray(row.types),
    score: ensureArray(row.score)
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formatted, null, 2), 'utf8');
  console.log(`Generated ${formatted.length} keyword records at ${OUTPUT_PATH}`);

  if (fs.existsSync(KEYWORD_TYPES_PATH)) {
    fs.copyFileSync(KEYWORD_TYPES_PATH, TYPES_OUTPUT_PATH);
    console.log(`Copied keyword type definitions to ${TYPES_OUTPUT_PATH}`);
  } else {
    console.warn('keyword-types.json not found; skipping copy.');
  }
};

main();
