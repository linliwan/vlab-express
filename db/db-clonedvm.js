import db from './db-client.js';

export async function getClonedVmsByLabIdUserId(labId, userId) {
  try {
    const query = 'SELECT * FROM cloned_vms WHERE lab_id = $1 AND user_id = $2';
    const result = await db.query(query, [labId, userId]);
    return result.rows;
  } catch (error) {
    console.error('获取虚拟机列表时出错:', error);
    throw error;
  }
}

export async function getClonedVmsByGroupIdLabId(groupId, labId) {
  try {
    const query = `
    SELECT 
        c.id,
        c.name,
        c.vm_id,
        c.lab_id,
        c.user_id,
        c.group_id,
        c.source_vm_id,
        u.email as email
    FROM 
        cloned_vms c 
    JOIN 
        users u ON c.user_id = u.id 
    WHERE
        c.group_id = $1 AND c.lab_id = $2
    `;
    const result = await db.query(query, [groupId, labId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting cloned VMs:', error);
    throw error;
  }
}

export async function getClonedVmsByLabId(labId) {
  try {
    const query = `
    SELECT 
        c.id,
        c.name,
        c.vm_id,
        c.lab_id,
        c.user_id,
        c.group_id,
        c.source_vm_id,
        u.email as email
    FROM 
        cloned_vms c 
    JOIN 
        users u ON c.user_id = u.id 
    WHERE
        c.lab_id = $1
    `;
    const result = await db.query(query, [labId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting cloned VMs:', error);
    throw error;
  }
}


export async function getClonedVmsByUserId(userId) {
  try {
    const query = `
    SELECT 
        c.id,
        c.name,
        c.vm_id,
        c.lab_id,
        c.user_id,
        c.group_id,
        c.source_vm_id,
        l.title as title,
        u.email as email
    FROM 
        cloned_vms c
    JOIN 
        labs l ON c.lab_id = l.id
    JOIN 
        users u ON c.user_id = u.id 
    WHERE
        c.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all cloned VMs:', error);
    throw error;
  }
}

export async function getClonedVmsByGroupId(groupId) {
  try {
    const query = 'SELECT * FROM cloned_vms WHERE group_id = $1';
    const result = await db.query(query, [groupId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all cloned VMs:', error);
    throw error;
  }
}

export async function createClonedVM(name, vmId, labId, userId, groupId, sourceVmId) {
  try {
    const query = 'INSERT INTO cloned_vms (name, vm_id, lab_id, user_id, group_id, source_vm_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const result = await db.query(query, [name, vmId, labId, userId, groupId, sourceVmId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating cloned VM:', error);
    throw error;
  }
}


export async function getClonedVMByVmId(vmId) {
  try {
    const query = `
    SELECT 
        c.id,
        c.name,
        c.vm_id,
        c.lab_id,
        c.user_id,
        c.group_id,
        c.source_vm_id,
        l.title as title,
        u.email as email
    FROM 
        cloned_vms c
    JOIN 
        labs l ON c.lab_id = l.id
    JOIN 
        users u ON c.user_id = u.id 
    WHERE
        c.vm_id = $1
    `;
    const result = await db.query(query, [vmId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting cloned VM:', error);
    throw error;
  }
}



export async function deleteClonedVMByVMId(vmId) {
  try {
    const query = 'DELETE FROM cloned_vms WHERE vm_id = $1 RETURNING *';
    const result = await db.query(query, [vmId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting cloned VM:', error);
    throw error;
  }
}

