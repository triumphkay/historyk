import sqlite3 from 'sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const dbPath = path.resolve(process.cwd(), '../data-pipeline/database/korean-history.db');
  
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(err.message);
        resolve(NextResponse.json({ error: 'Failed to connect to the database' }, { status: 500 }));
        return;
      }
    });

    db.all("SELECT id, keyword, descriptions, types FROM newwords", [], (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      } else {
        // Parse JSON strings in the rows
        const parsedRows = rows.map((row: any) => {
          try {
            return {
              ...row,
              descriptions: JSON.parse(row.descriptions),
              types: JSON.parse(row.types)
            };
          } catch (e) {
            return {
              ...row,
              descriptions: [],
              types: []
            };
          }
        });
        resolve(NextResponse.json(parsedRows));
      }
      db.close();
    });
  });
}
