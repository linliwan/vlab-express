import pg from 'pg';
import { dbConfig } from '../config.js';

const db = new pg.Client(dbConfig);
db.connect();

export default db;