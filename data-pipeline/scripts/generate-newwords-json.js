#!/usr/bin/env node
/**
 * Generates app/assets/data.json from database/korean-history.db newwords table.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'database', 'korean-history.db');
const OUTPUT_PATH = path.join(ROOT, '..', 'app', 'assets', 'data.json');

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
      `sqlite3 -json ${JSON.stringify(DB_PATH)} "SELECT id, keyword, descriptions, ref_id, q_ref_id, types, scores, era, sub_era, det_era, years, years_check, era_script FROM newwords"`,
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
    scores: ensureArray(row.scores),
    era: ensureArray(row.era),
    sub_era: ensureArray(row.sub_era),
    det_era: ensureArray(row.det_era),
    years: row.years || '',
    years_check: row.years_check || '',
    era_script: ensureArray(row.era_script)
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formatted, null, 2), 'utf8');
  console.log(`Generated ${formatted.length} newwords records at ${OUTPUT_PATH}`);
};

main();
