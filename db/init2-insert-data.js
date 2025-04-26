import pg from 'pg';
import { dbConfig } from '../config.js';
import { userSettings } from '../config.js';
import bcrypt from 'bcrypt';

const db = new pg.Client(dbConfig);

async function createDefaultCategories() {
  try {
    const query = 'INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *';
    await db.query(query, [1, 'Network']);
    await db.query(query, [2, 'Cloud']);
    console.log('Lab categories created successfully');
  } catch (error) {
    console.error('failed to create categories', error);
  }
}
async function createDefaultRoles() {
  try {
    const query = 'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) RETURNING *';
    await db.query(query, [userSettings.adminRoleId, 'admin', 'Administrator with full access']);
    await db.query(query, [userSettings.advantageRoleId, 'advantage', 'User with advanced privileges']);
    await db.query(query, [userSettings.userRoleId, 'user', 'User with basic privileges']);
    console.log('Roles created successfully');
  } catch (error) {
    console.error('failed to create roles', error);
  }
}

async function createDefaultGroups() {
  try {
    const query = 'INSERT INTO groups (id, name, description) VALUES ($1, $2, $3) RETURNING *';
    await db.query(query, [0, 'teachers', 'Default teacher group']);
    await db.query(query, [1, 'students', 'Default student group']);
    console.log('Groups created successfully');
  } catch (error) {
    console.error('failed to create groups', error);
  }
}

async function createDefaultAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(userSettings.defaultAdminPassword, userSettings.saltRounds);
    const query = `
      INSERT INTO users (id, username, password, email, role_id, group_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, role_id, group_id
    `;
    const values = [0, userSettings.defaultAdminUsername, hashedPassword, userSettings.defaultAdminEmail, 1, 0];
    await db.query(query, values);
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createManualLab() {
  try {
    const query = 'INSERT INTO labs (id, title, category_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(query, [userSettings.manualLabId, '手动分配专用，切勿删除', 1]);
    console.log('Manual lab created successfully');
  } catch (error) {
    console.error('failed to create manual lab', error);
  }
}

async function main() {
  try {
    await db.connect();
    await createDefaultCategories();
    await createDefaultRoles();
    await createDefaultGroups();
    await createManualLab();
    await createDefaultAdmin();
    console.log('All initialization operations completed');
  } catch (error) {
    console.error('Error during initialization:', error);
  } finally {
    await db.end();
  }
}

main();