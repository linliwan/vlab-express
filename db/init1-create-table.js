import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client(dbConfig);

async function createTables() {
  try {
    await db.connect();
    console.log('Database connected successfully');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create-table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL statements
    await db.query(sql);
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await db.end();
  }
}

createTables(); 