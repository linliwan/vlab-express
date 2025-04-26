import express from 'express';
import {
  adminNavItems,
  vmFolder,
  cis,
  userSettings
} from '../config.js';

import {
  getAllUsersByGroup,
  getAllGroups,
  deleteUsers,
  resetUserPasswords,
  deleteGroup,
  createGroup,
  createUser,
  getGroupById,
  getAllUsersByRole
} from '../db/db-users.js';

import {
  getAllLabs,
  createLab,
  deleteLab,
  getAssignements,
  deleteAssignment,
  assignLabToGroup,
  updateLab,
  getLabById,
  getAssignmentById
} from '../db/db-labs.js';

import {
  getAllCategories
} from '../db/db-categories.js';

import { 
  createTag,
  deleteTag,
  attachTagToVM,
  listAttachedObjectsOnTags
} from '../vmware/cis-operations.js';

import { 
  getVMList,
  cloneVM,
  getPowerState,
  deleteVM,
  setPowerState,
  getVMConsoleTicket
} from '../vmware/vm-operations.js';

import {
  getClonedVmsByUserId,
  createClonedVM,
  getClonedVmsByGroupIdLabId,
  getClonedVmsByLabId,
  getClonedVMByVmId,
  deleteClonedVMByVMId
} from '../db/db-clonedvm.js';

const router = express.Router();

// Admin home page
router.get('/', (req, res) => {
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: ''
  });
});

// User management
// Get all users, this route is used to display the user management interface
router.get('/users', async (req, res) => {
  try {
    const groupid = req.query.groupid;
    const groups = await getAllGroups();
    let users = [];
    if (groupid) {
      users = await getAllUsersByGroup(groupid);
    }

    res.render('admin.ejs', {
      navItems: adminNavItems,
      content: './content/users/users.ejs',
      users,
      groups,
      groupid
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

router.delete('/users', async (req, res) => {
  const userIds = req.body.userIds;
  const response = await deleteUsers(userIds);
  res.json({
    success: true,
    message: `Successfully deleted ${response.rowCount} users`
  });
});

router.post('/users/password', async (req, res) => {
  const userIds = req.body.userIds;
  const newPassword = req.body.password;
  const response = await resetUserPasswords(userIds, newPassword);
  res.json({
    success: true,
    message: `Successfully reset the password for ${response.rowCount} users`
  });
});


router.get('/users/newuser', async (req, res) => {
  const groups = await getAllGroups();
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/users/newuser.ejs',
    groups
  });
});


router.post('/users/newuser', async (req, res) => {
  try {
    const { username, password, group } = req.body;
    const groupInfo = await getGroupById(group);
    const groupName = groupInfo.name || 'none';
    const newUser = await createUser(
      username,
      password,
      `${username}@${groupName}.vlab.com`,
      userSettings.userRoleId,
      group
    );
    res.json({
      success: true,
      message: `Successfully created user: ${username}@${groupName}.vlab.com`,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user: ' + error.message
    });
  }
});


router.post('/users/newuser-batch', async (req, res) => {
  try {
    const { username, password, group, number } = req.body;
    const groupInfo = await getGroupById(group);
    const groupName = groupInfo.name || 'none';
    const count = Math.min(parseInt(number), 60);
    const createdUsers = [];

    for (let i = 1; i <= count; i++) {
      const userNumber = i.toString().padStart(2, '0');
      const newUser = await createUser(
        `${username}${userNumber}`,
        password,
        `${username}${userNumber}@${groupName}.vlab.com`,
        userSettings.userRoleId,
        group
      );
      createdUsers.push(newUser);
    }
    res.json({
      success: true,
      message: `Successfully created ${createdUsers.length} users`,
      users: createdUsers
    });
  } catch (error) {
    console.error('Error creating users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create users: ' + error.message
    });
  }
});


router.get('/users/advantage', async (req, res) => {
  const users = await getAllUsersByRole(userSettings.advantageRoleId);
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/users/advantage.ejs',
    users
  });
});

router.post('/users/advantage', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = await createUser(
      username,
      password,
      `${username}@vlab.com`,
      userSettings.advantageRoleId,
      0
    );
    res.json({
      success: true,
      message: `Successfully created advantage user: ${username}`,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating advantage user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create advantage user: ' + error.message
    });
  }
});



// Group management
router.get('/groups', async (req, res) => {
  const groups = await getAllGroups();
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/users/groups.ejs',
    groups
  });
});


// Get all users in the group, this route responds to ajax requests, and selects users based on the group ID
router.get('/groups/:group_id', async (req, res) => {
  try {
    const groupId = req.params.group_id;
    
    if (isNaN(parseInt(groupId))) {
      return res.status(400).json({ error: 'group_id must be a number' });
    }
    const users = await getAllUsersByGroup(groupId);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by group:', error);
    res.status(500).json({ error: 'Failed to get users list' });
  }
});

router.post('/groups', async (req, res) => {
  const category_id = cis.category_id;
  try {
    const { name, description } = req.body;
    const vmware_tag_id = await createTag(category_id, name);
    console.log(`Created a vmware tag ${vmware_tag_id} for group ${name} in vCenter`);
    const response = await createGroup(name, description, vmware_tag_id);
    console.log(`Successfully created group ${name} in the database 🫰🫰🫰`);
    res.json({
      success: true,
      message: `Successfully created group: ${name}, description: ${description}`
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group: ' + error.message
    });
  }
});

router.delete('/groups/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`Delete group ${id}, and delete the vmware tag corresponding to the group`);
  const groupInfo = await getGroupById(id);
  const vmware_tag_id = groupInfo.vmware_tag_id;
  console.log(`Get the vmware_tag_id: ${vmware_tag_id}`);
  await deleteTag(vmware_tag_id);
  console.log(`Successfully deleted vmware_tag_id: ${vmware_tag_id}`);
  const response = await deleteGroup(id);
  console.log(`Successfully deleted group ${id} 🫰🫰🫰`);
  if (response.success) {
    res.json({
      success: true,
      message: response.message
    });
  } else {
    res.status(500).json({
      success: false,
      message: response.message
    });
  }
});


// Lab management
router.get('/labs', async (req, res) => {
  const labs = await getAllLabs();
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/labs/labs.ejs',
    labs
  });
});

router.delete('/labs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await deleteLab(id);
    res.json({
      success: true,
      message: `Successfully deleted lab: ${id}`
    });
  } catch (error) {
    console.error('Error deleting lab:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lab: ' + error.message
    });
  }
});

router.get('/labs/newlab', async (req, res) => {
  const id = req.query.id;
  let lab = null;
  let selectedVms = [];
  if (id) {
    lab = await getLabById(id);
    if (lab) {
      selectedVms = lab.vm_ids || [];
    }
  }
  const categories = await getAllCategories();
  const vms = await getVMList([vmFolder.source]);    // 虚拟机模版都放在一个特定的文件夹中

  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/labs/newlab.ejs',
    categories,
    vms,
    lab,
    selectedVms,
    isEdit: !!id    // If id exists, it means it is an edit lab, otherwise it is a new lab
  });
});

router.post('/labs/newlab', async (req, res) => {
  const { title, category, link, description, vms } = req.body;
  try {
    const response = await createLab(title, category, link, description, vms);
    if (response && response.rowCount > 0) {
      res.json({
        success: true,
        message: `Successfully created lab: ${title}, id: ${response.rows[0].id}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create lab:未能插入数据'
      });
    }
  } catch (error) {
    console.error('Error creating lab:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lab: ' + error.message
    });
  }
});

router.put('/labs/:id', async (req, res) => {
  const id = req.params.id;
  const { title, category, link, description, vms } = req.body;
  try {
    const response = await updateLab(id, title, category, link, description, vms);

    if (response && response.rowCount > 0) {
      res.json({
        success: true,
        message: `Successfully updated lab: ${title}`,
        labId: id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update lab:Failed to update data'
      });
    }
  } catch (error) {
    console.error('Error updating lab:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lab: ' + error.message
    });
  }
});

router.get('/labs/assign', async (req, res) => {
  try {
    let labs = await getAllLabs();
    labs = labs.filter(lab => lab.id !== userSettings.manualLabId);
    const groups = await getAllGroups();
    const assignments = await getAssignements();
    res.render('admin.ejs', {
      navItems: adminNavItems,
      content: './content/labs/assign.ejs',
      labs,
      groups,
      assignments
    });
  } catch (error) {
    console.error('Error fetching labs and groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get labs and groups: ' + error.message
    });
  }
});

router.post('/labs/assign', async (req, res) => {
  try {
    const { lab_id, group_id } = req.body;

    setTimeout(async () => {
      // Get the group information, and get the vmware tag ID of the group
      const groupInfo = await getGroupById(group_id);
      const vmware_tag_id = groupInfo.vmware_tag_id;
      console.log(`Get the vmware_tag_id: ${vmware_tag_id}`);

      // Get the vm list of the lab
      const lab = await getLabById(lab_id);
      const vm_ids = lab.vm_ids;
      console.log(`Get the vm list of lab ${lab_id}, there are ${vm_ids.length} vms`);

      // Get all users in the group
      const users = await getAllUsersByGroup(group_id);
      console.log(`Get all users in group ${group_id}, there are ${users.length} users`);

      // Iterate through all users, and clone the vms for each user
      for (const user of users) {
        const user_id = user.id;
        // Clone the vms for each user
        for (const source_vm_id of vm_ids) {
          // Generate a unique name
          const randomChars = Math.random().toString(36).substring(2, 8);
          const vmName = `L${lab_id}-${source_vm_id}-G${group_id}-U${user_id}-${randomChars}`;
          const cloneSpec = {
            name: vmName,
            source: source_vm_id,
            placement: { folder: vmFolder.target }
          };

          // Clone the vm
          const cloneResult = await cloneVM(cloneSpec);
          const vm_id = cloneResult.clonedVmId;
          console.log(`Successfully cloned vm ${vmName}, vm_id: ${vm_id}`);
          // Tag the vm in vCenter, batch operation, this step is temporarily skipped, to减轻vCenter负担
          // await attachTagToVM(vm_id, vmware_tag_id);
          // Write the cloned vm record to the database
          await createClonedVM(vmName, vm_id, lab_id, user_id, group_id, source_vm_id);
          console.log(`Successfully wrote the cloned vm record to the database, vmName: ${vmName}, vm_id: ${vm_id}, lab_id: ${lab_id}, user_id: ${user_id}, group_id: ${group_id}, source_vm_id: ${source_vm_id}`);
        }
      }
      console.log(`Successfully completed the cloning task, 🫰🫰🫰`);
    }, 0);
    const response = await assignLabToGroup(lab_id, group_id);
    console.log(`Successfully associated lab ${lab_id} with group ${group_id} in the database, and submitted the cloned vm task to vCenter. 🫰🫰🫰`);
    res.json({
      success: true,
      message: `Successfully associated lab ${lab_id} with group ${group_id} in the database, and submitted the cloned vm task to vCenter. 🫰🫰🫰`
    });
  } catch (error) {
    console.error('Error assigning lab to group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign lab to group: ' + error.message
    });
  }
});


router.post('/labs/assign/tag', async (req, res) => {
  try {
    const { id } = req.body;
    const assignment = await getAssignmentById(id);
    const lab_id = assignment.lab_id;
    const group_id = assignment.group_id;
    console.log(`Get the lab_id: ${lab_id}, and the group_id: ${group_id}`);
    const groupInfo = await getGroupById(group_id);
    const vmware_tag_id = groupInfo.vmware_tag_id;
    console.log(`Get the vCenter tag_id: ${vmware_tag_id}`);
    const vms = await getClonedVmsByGroupIdLabId(group_id, lab_id);
    const vm_ids = vms.map(vm => vm.vm_id);
    console.log(`Get the vm list, there are ${vm_ids.length} vms`);
    for (const vm_id of vm_ids) {
      const response = await attachTagToVM(vm_id, vmware_tag_id);
      console.log(`Successfully tagged vm ${vm_id} with ${vmware_tag_id}`);
    }
    console.log(`Successfully completed the tagging task, 🫰🫰🫰`);
    res.json({
      success: true,
      message: `Successfully tagged ${vm_ids.length} vms with ${vmware_tag_id}`
    });
  } catch (error) {
    console.error('Error tagging lab:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to tag lab: ' + error.message
    });
  }
});


router.delete('/labs/assign/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const assignment = await getAssignmentById(id);
    const lab_id = assignment.lab_id;
    const group_id = assignment.group_id;
    console.log(`Get the lab_id: ${lab_id}, and the group_id: ${group_id}`);
    const groupInfo = await getGroupById(group_id);
    const vmware_tag_id = groupInfo.vmware_tag_id;
    console.log(`Get the vCenter tag_id: ${vmware_tag_id}`);
    const vms = await getClonedVmsByGroupIdLabId(group_id, lab_id);
    const vm_ids = vms.map(vm => vm.vm_id);
    console.log(`Get the vm list, there are ${vm_ids.length} vms`);
    for (const vm_id of vm_ids) {
      const response1 = await deleteVM(vm_id);
      console.log(`Successfully deleted vm ${vm_id} from vCenter`);
      const response2 = await deleteClonedVMByVMId(vm_id);
      console.log(`Successfully deleted the record of vm ${vm_id} from the database`);
    }
    const response3 = await deleteAssignment(id);
    console.log(`Successfully completed the deletion task, 🫰🫰🫰`);
    res.json({
      success: true,
      message: `Successfully deleted the assignment: ${id}`
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment: ' + error.message
    });
  }
});

router.get('/vms/clonedvms', async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  const groups = await getAllGroups();
  const clonedVms = await getClonedVmsByUserId(userId);
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/vms/clonedvms.ejs',
    groups,
    userId,
    clonedVms
  });
});

router.get('/vms/manualclone', async (req, res) => {
  const source_vms = await getVMList([vmFolder.source]);
  const groups = await getAllGroups();
  let labs = await getAllLabs();
  labs = labs.filter(lab => lab.id !== userSettings.manualLabId);
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/vms/manualclone.ejs',
    source_vms,
    groups,
    labs
  });
});

router.post('/vms/manualclone', async (req, res) => {
  try {
    let { group_id, user_id, source_vm_id, lab_id } = req.body;
    let source_vm_list = [];
    let message = '';
    if (!group_id || !user_id || (!source_vm_id && !lab_id)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    if (!lab_id && source_vm_id) {
      lab_id = userSettings.manualLabId;  // If lab_id is empty, use the default lab ID
      source_vm_list.push(source_vm_id);
    } else if (lab_id) {
      const lab = await getLabById(lab_id);
      source_vm_list = lab.vm_ids;
    }
    for (const source_vm_id of source_vm_list) {
      // Generate a unique name
      const randomChars = Math.random().toString(36).substring(2, 8);
      const vmName = `M${lab_id}-${source_vm_id}-G${group_id}-U${user_id}-${randomChars}`;
      const cloneSpec = {
        name: vmName,
        source: source_vm_id,
        placement: { folder: vmFolder.target }
      };

      // Get the group information and get the vmware tag ID of the group
      const groupInfo = await getGroupById(group_id);
      const vmware_tag_id = groupInfo.vmware_tag_id;

      // Clone the vm
      const cloneResult = await cloneVM(cloneSpec);
      const vm_id = cloneResult.clonedVmId;

      // Tag the vm in vCenter
      await attachTagToVM(vm_id, vmware_tag_id);
      // Write the cloned vm record to the database
      await createClonedVM(vmName, vm_id, lab_id, user_id, group_id, source_vm_id);
      console.log(`Successfully wrote the cloned vm record to the database, vmName: ${vmName}, vm_id: ${vm_id}, lab_id: ${lab_id}, user_id: ${user_id}, group_id: ${group_id}, source_vm_id: ${source_vm_id}`);
      message += `vmName: ${vmName}, vm_id: ${vm_id};`;
    }
    console.log(`Successfully completed the cloning task, 🫰🫰🫰`);
    res.json({
      success: true,
      message: `Successfully assigned the vms, ${message}`,
    });

  } catch (error) {
    console.error('Error cloning VM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign the vms: ' + error.message
    });
  }
});


router.get('/vmadmin/:id', async (req, res) => {
  try {
    const response = await getPowerState(req.params.id);
    const powerState = response.state;
    // Build the HTML for the status indicator and operation buttons
    let html = '';
    // Add the status indicator
    if (powerState === 'POWERED_ON') {
      html += '<div class="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>';
    } else if (powerState === 'UNKNOWN') {
      html += '<div class="w-2 h-2 bg-gray-500 rounded-full shrink-0"></div>';
    } else {
      html += '<div class="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>';
    }
    // Add the operation buttons
    html += '<div class="flex gap-2 shrink-0 ml-2">';
    if (powerState === 'POWERED_OFF') {
      html += `
        <a href="#" 
           hx-post="/admin/vm/${req.params.id}/power" 
           hx-vals='{"action": "start", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-green-600 hover:text-green-500">Start</a>
        <a href="#" 
           hx-delete="/admin/vm/${req.params.id}" 
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-red-600 hover:text-red-500">Delete</a>
      `;
    } else if (powerState === 'UNKNOWN') {
      html += `
        <a href="#" 
           hx-delete="/admin/vm/${req.params.id}" 
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-red-600 hover:text-red-500">Delete</a>
        <span class="text-gray-500 ml-2 text-xs">Unknown</span>
      `;
    } else {
      html += `
        <a href="#" 
           hx-post="/admin/vm/${req.params.id}/power" 
           hx-vals='{"action": "stop", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-red-600 hover:text-red-500">Shutdown</a>
        <a href="#" 
           hx-post="/admin/vm/${req.params.id}/power" 
           hx-vals='{"action": "reset", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-yellow-600 hover:text-yellow-500">Restart</a>
        <a href="/admin/vm/${req.params.id}/consoleproxy" 
           target="_blank"
           class="font-medium text-indigo-600 hover:text-indigo-500 pl-4">Console</a>
      `;
    }
    html += '</div>';
    res.send(html);
  } catch (error) {
    console.error(`Failed to get the power state of vm ${req.params.id}:`, error);
    res.status(500).send('<div class="w-2 h-2 bg-gray-500 rounded-full shrink-0"></div><span class="text-red-500 ml-2">Failed to get the power state</span>');
  }
});

router.post('/vm/:id/power', async (req, res) => {
  try {
    // Check if the vmId belongs to ClonedVM
    const clonedVms = await getClonedVMByVmId(req.params.id);
    if (!clonedVms) {
      return res.status(403).json({ error: 'Illegal operation!!!' });
    } else {
      console.log(`The vm power operation is legal, start to execute the operation`)
    }

    const vmId = req.params.id;
    const { action } = req.body;
    
    // The setPowerState operation does not wait for the result
    await setPowerState(vmId, action);
    
    // Pass the ID and delay data
    res.set('HX-Trigger', JSON.stringify({
      'vmStatusChanged': { id: vmId, delay: 6000 }
    }));
    
    // Return a simple response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Failed to execute the vm ${req.params.id} operation:`, error);
    res.status(500).json({ success: false });
  }
});

router.delete('/vm/:id', async (req, res) => {
  try {
    // Check if the vmId belongs to ClonedVM
    const clonedVms = await getClonedVMByVmId(req.params.id);
    if (!clonedVms) {
      return res.status(403).json({ error: 'Illegal operation!!!' });
    } else {
      console.log(`The vm delete operation is legal, start to execute the operation`)
    }

    const vmId = req.params.id;

    const result2 = await deleteVM(vmId);
    console.log(`Successfully deleted the vm ${vmId} from vCenter`);
    const result1 = await deleteClonedVMByVMId(vmId);
    console.log(`Successfully deleted the record of vm ${vmId} from the database`);

    res.set('HX-Trigger', JSON.stringify({
      'vmStatusChanged': { id: vmId, delay: 6000 }
    }));

    if (result1.id && result2.success) {
      res.status(200).json({ success: true, message: `The vm ${vmId} has been deleted` });
    } else {
      res.status(500).json({ success: false, message: `Failed to delete the vm ${vmId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.get('/vm/:id/console', async (req, res) => {
//   try {
//     const vmId = req.params.id;
//     const response = await getVMConsoleTicket(vmId);
//     console.log(response);
//     res.render('console', { ticket: response.value.ticket });
//   } catch (error) {
//     console.error('Failed to get the console ticket:', error);
//     res.status(500).json({ error: 'Failed to get the console ticket' });
//   }
// });

// Get the vm console ticket (through reverse proxy)
router.get('/vm/:id/consoleproxy', async (req, res) => {
  try {
    const vmId = req.params.id;
    const response = await getVMConsoleTicket(vmId);
    const ticket = response.value.ticket;
    
    // Parse the original ticket
    const match = ticket.match(/wss:\/\/([^\/]+)\/ticket\/([^\/]+)/);
    if (!match) {
      throw new Error('Failed to parse the console ticket');
    }
    
    const esxiHost = match[1];
    const ticketId = match[2];
  
    // Build the ticket pointing to the reverse proxy server
    const proxyHost = process.env.PROXY_HOST || 'localhost:8443';
    const modifiedTicket = `wss://${proxyHost}/esxi/${esxiHost}/ticket/${ticketId}`;
    // console.log(modifiedTicket);
    // Render the console page, and pass the modified ticket
    res.render('console', { ticket: modifiedTicket });
  } catch (error) {
    console.error('Failed to get the console ticket:', error);
    res.status(500).render('error', { message: 'Failed to get the console ticket' });
  }
});


router.get('/vms/clonedvms-group', async (req, res) => {
  const { assignment_id, group_id } = req.query;
  const assignments = await getAssignements();
  const groups = await getAllGroups();
  let vms = [];
  // Query by assignment_id
  if (assignment_id && assignment_id != userSettings.manualLabId) {
    const assignment = await getAssignmentById(assignment_id);
    const lab_id = assignment.lab_id;
    const group_id = assignment.group_id;
    console.log(`Get the lab_id: ${lab_id}, and the group_id: ${group_id}`);
    vms = await getClonedVmsByGroupIdLabId(group_id, lab_id);
  } else if (assignment_id == userSettings.manualLabId) {
    // The manually cloned vms, query by lab_id
    vms = await getClonedVmsByLabId(userSettings.manualLabId);
  } else if (group_id) {
    // Query by vmware tag
    const groupInfo = await getGroupById(group_id);
    const vmware_tag_id = groupInfo.vmware_tag_id;
    console.log(`Get the vCenter tag_id: ${vmware_tag_id}`);
    const vc_response = await listAttachedObjectsOnTags(vmware_tag_id);
    for (const vm_id of vc_response) {
      const vmInfo = await getClonedVMByVmId(vm_id);
      if (vmInfo) {
        vms.push(vmInfo);
      } else {
        vms.push({ vm_id: vm_id, name: `No record`, email: `No record` });
      }
    }
  }
  res.render('admin.ejs', {
    navItems: adminNavItems,
    content: './content/vms/clonedvms-group.ejs',
    assignments,
    groups,
    assignment_id,
    group_id,
    vms
  });
});

router.post('/vms/tasks/batchpoweroff', async (req, res) => {
  const { vm_ids } = req.body;
  console.log(`Get the vm list, there are ${vm_ids.length} vms`);
  for (const vm_id of vm_ids) {
    // Check if the VM_id belongs to ClonedVM
    const clonedVms = await getClonedVMByVmId(vm_id);
    if (!clonedVms) {
      console.log(`The vm_id does not belong to the cloned vm, skip ❌`);
      continue;
    } else {
      console.log(`The vm_id belongs to the cloned vm, start to execute the operation ✅`)
    }
    const powerStateInfo = await getPowerState(vm_id);
    console.log(`The vm ${vm_id} current power state: ${powerStateInfo.state}`);
    if (powerStateInfo.state === 'POWERED_ON') {
      await setPowerState(vm_id, 'stop');
      console.log(`The shutdown command has been sent to the vm ${vm_id}`);
    } else {
      console.log(`The vm ${vm_id} is skipped`);
    }
  }
  console.log(`All the shutdown commands have been sent to vCenter 🫰🫰🫰`);
  res.json({
    success: true,
    message: `All the shutdown commands have been sent to vCenter`
  });
});

export default router; 