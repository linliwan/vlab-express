import db from './db-client.js';

export async function createCategory(name) {
  try {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function updateCategory(id, name) {
  try {
    const query = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [name, id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function getAllCategories() {
  try {
    const query = 'SELECT id, name FROM categories ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
}

export async function getCategoryById(id) {
  try {
    const query = 'SELECT id, name FROM categories WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
}