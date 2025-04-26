import db from './db-client.js';

export async function createLab(title, category, link, description, vms ) {
  try {
    const query = 'INSERT INTO labs (title, description, link, category_id, vm_ids) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await db.query(query, [title, description, link, category, vms]);
    return result;
  } catch (error) {
    console.error('failed to create lab', error);
    throw error;
  }
}

export async function getLabById(id) {
  try {
    const query = `
    SELECT 
      l.id, 
      l.title, 
      l.description, 
      l.link, 
      l.category_id,
      l.vm_ids,
      c.name AS category_name
    FROM labs l
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE l.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('failed to get lab by id', error);
    throw error;
  }
}

export async function deleteLab(id) {
  try {
    const query = 'DELETE FROM labs WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('failed to delete lab', error);
    throw error;
  }
}

export async function getAllLabs() {
  try {
    const query = `
    SELECT 
      l.id, 
      l.title, 
      l.description, 
      l.link, 
      l.category_id,
      l.vm_ids,
      c.name AS category_name
    FROM labs l
    LEFT JOIN categories c ON l.category_id = c.id
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('failed to get all labs', error);
    throw error;
  }
}

export async function getLabsByCategory(categoryId) {
  try {
    const query = `
    SELECT 
      l.id, 
      l.title, 
      l.description, 
      l.link, 
      l.category_id,
      c.name AS category_name
    FROM labs l
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE l.category_id = $1
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows;
  } catch (error) {
    console.error('failed to get labs by category', error);
    throw error;
  }
}

export async function getAssignements() {
  try {
    const query = `
    SELECT 
      lg.id,
      lg.lab_id,
      lg.group_id,
      l.title AS lab_title,
      g.name AS group_name
    FROM lab_groups lg
    LEFT JOIN labs l ON lg.lab_id = l.id
    LEFT JOIN groups g ON lg.group_id = g.id
    ORDER BY lg.lab_id
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('failed to get assignements', error);
    throw error;
  }
}

export async function getAssignementsByGroupId(groupId) {
  try {
    const query = `
    SELECT 
      lab_id
    FROM lab_groups
    WHERE group_id = $1
    `;
    const result = await db.query(query, [groupId]);
    return result.rows;
  } catch (error) {
    console.error('failed to get assignements by group id', error);
    throw error;
  }
}

export async function getAssignmentById(id) {
  try {
    const query = 'SELECT * FROM lab_groups WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('failed to get assignment by id', error);
    throw error;
  }
}

export async function assignLabToGroup(labId, groupId) {
  try {
    const query = 'INSERT INTO lab_groups (lab_id, group_id) VALUES ($1, $2) RETURNING *';
    const result = await db.query(query, [labId, groupId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('failed to assign lab to group', error);
    throw error;
  }
}

export async function deleteAssignment(id) {
  try {
    const query = 'DELETE FROM lab_groups WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('failed to delete assignment', error);
    throw error;
  }
}

export async function updateLab(id, title, category, link, description, vms) {
  try {
    const query = `
      UPDATE labs 
      SET title = $1, description = $2, link = $3, category_id = $4, vm_ids = $5
      WHERE id = $6
      RETURNING *
    `;
    const result = await db.query(query, [title, description, link, category, vms, id]);
    return result;
  } catch (error) {
    console.error('failed to update lab', error);
    throw error;
  }
}
