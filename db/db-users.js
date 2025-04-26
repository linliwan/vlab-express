import db from './db-client.js';
import bcrypt from 'bcrypt';
import { dbConfig } from '../config.js';
import { userSettings } from '../config.js';

export async function createUser(username, password, email, roleId, groupId=null) {
  try {
    const hashedPassword = await bcrypt.hash(password, userSettings.saltRounds);
    const query = `
      INSERT INTO users (username, password, email, role_id, group_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role_id, group_id
    `;
    const values = [username, hashedPassword, email, roleId, groupId];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(id) {
    try {
        const query = `
        SELECT 
          u.id, 
          u.username, 
          u.email,
          u.role_id,
          u.group_id,
          r.name AS role_name,
          g.name AS group_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN groups g ON u.group_id = g.id
        WHERE u.id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

export async function getUserByEmail(email) {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username,
        u.email,
        u.password,
        u.role_id,
        u.group_id,
        r.name AS role_name,
        g.name AS group_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by Email:', error);
    throw error;
  }
}

export async function updateUserInfo(id, username, roleId, groupId) {
  try {
    const query = 'UPDATE users SET username = $1, role_id = $2, group_id = $3 WHERE id = $4';
    await db.query(query, [username, roleId, groupId, id]);
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
}

export async function getAllUsersByRole(roleId) {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE role_id = $1
    `;
    const result = await db.query(query, [roleId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all users by role:', error);
    throw error;
  }
}


export async function getAllUsersByGroup(groupId, limit = 60, offset = 0) {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        r.name AS role_name,
        g.name AS group_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.group_id = $1
      ORDER BY u.id
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [groupId, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all users by group:', error);
    throw error;
  }
}

export async function deleteUsers(userIds) {
  try {
    const query = 'DELETE FROM users WHERE id = ANY($1)';
    const response = await db.query(query, [userIds]);
    return response;
  } catch (error) { 
    console.error('Error deleting users:', error);
    throw error;
  }
}

export async function resetUserPasswords(userIds, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, userSettings.saltRounds);
    const query = 'UPDATE users SET password = $1 WHERE id = ANY($2)';
    const response = await db.query(query, [hashedPassword, userIds]);
    return response;
  } catch (error) { 
    console.error('Error resetting user passwords:', error);
    throw error;
  }
}

// 组操作
export async function getAllGroups(limit = 30, offset = 0) {
  try {
    const query = `
      SELECT *
      FROM groups
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all groups:', error);
    throw error;
  }
}

export async function getGroupById(id) {
  try {
    const query = 'SELECT * FROM groups WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting group by ID:', error);
    throw error;
  }
}

export async function createGroup(name, description, vmware_tag_id) {
  try {
    const query = 'INSERT INTO groups (name, description, vmware_tag_id) VALUES ($1, $2, $3)';
    await db.query(query, [name, description, vmware_tag_id]);
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

export async function deleteGroup(id) {
  try {
    const query1 = 'DELETE FROM users WHERE group_id = $1'; // 删除组下所有用户
    const query2 = 'DELETE FROM groups WHERE id = $1'; // 删除组
    const response1 = await db.query(query1, [id]);
    const response2 = await db.query(query2, [id]);
    return {
      success: true,
      message: `成功删除 ${response1.rowCount} 个用户和 ${response2.rowCount} 个组`
    };
  } catch (error) { 
    console.error('Error deleting group:', error);
    throw error;
  }
}