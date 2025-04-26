import express from 'express';
import {
  getPowerState,
  setPowerState,
  getVMConsoleTicket
} from "../vmware/vm-operations.js";
import { getClonedVmsByUserId } from '../db/db-clonedvm.js';

const router = express.Router();

router.get('/:id/power', async (req, res) => {
  try {
    // Get the current user ID
    const userId = req.user.id;
    const clonedVms = await getClonedVmsByUserId(userId);
    // Check if the current virtual machine belongs to the current user
    const currentVm = clonedVms.find(vm => vm.vm_id === req.params.id);
    if (!currentVm) {
      return res.status(403).json({ error: 'You do not have permission to operate this virtual machine' });
    }
    const response = await getPowerState(req.params.id);
    const powerState = response.state;
    // Build the HTML for the status indicator and action buttons
    let html = '';
    // Add the status indicator
    if (powerState === 'POWERED_ON') {
      html += '<div class="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>';
    } else if (powerState === 'UNKNOWN') {
      html += '<div class="w-2 h-2 bg-gray-500 rounded-full shrink-0"></div>';
    } else {
      html += '<div class="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>';
    }
    // Add the action buttons
    html += '<div class="flex gap-2 shrink-0 ml-2">';
    if (powerState === 'POWERED_OFF') {
      html += `
        <a href="#" 
           hx-post="/vm/${req.params.id}/power" 
           hx-vals='{"action": "start", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-green-600 hover:text-green-500">Start</a>
      `;
    } else if (powerState === 'UNKNOWN') {
      // For unknown status, we do not provide any action buttons
      html += `<span class="text-gray-500 ml-2 text-xs">Unknown status, please try again later</span>`;
    } else {
      html += `
        <a href="#" 
           hx-post="/vm/${req.params.id}/power" 
           hx-vals='{"action": "stop", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-red-600 hover:text-red-500">Shutdown</a>
        <a href="#" 
           hx-post="/vm/${req.params.id}/power" 
           hx-vals='{"action": "reset", "labId": "${req.query.labId}"}'
           hx-swap="none"
           hx-target="#vm-status-${req.params.id}"
           class="font-medium text-yellow-600 hover:text-yellow-500">Restart</a>
        <a href="/vm/${req.params.id}/consoleproxy" 
           target="_blank"
           class="font-medium text-indigo-600 hover:text-indigo-500 pl-4">Console</a>
      `;
    }
    html += '</div>';
    res.send(html);
  } catch (error) {
    console.error(`Failed to get the power state of the virtual machine ${req.params.id}:`, error);
    res.status(500).send('<div class="w-2 h-2 bg-gray-500 rounded-full shrink-0"></div><span class="text-red-500 ml-2">Failed to get the power state</span>');
  }
});

router.post('/:id/power', async (req, res) => {
  try {
    // Get the current user ID
    const userId = req.user.id;
    const clonedVms = await getClonedVmsByUserId(userId);
    // Check if the current virtual machine belongs to the current user
    const currentVm = clonedVms.find(vm => vm.vm_id === req.params.id);
    if (!currentVm) {
      return res.status(403).json({ error: 'You do not have permission to operate this virtual machine' });
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
    console.error(`Failed to execute the operation on the virtual machine ${req.params.id}:`, error);
    res.status(500).json({ success: false });
  }
});

// Get the virtual machine console ticket (through reverse proxy)
router.get('/:id/consoleproxy', async (req, res) => {
  try {
    const vmId = req.params.id;

    // Get the current user ID
    const userId = req.user.id;
    const clonedVms = await getClonedVmsByUserId(userId);
    // Check if the current virtual machine belongs to the current user
    const currentVm = clonedVms.find(vm => vm.vm_id === req.params.id);
    if (!currentVm) {
      return res.status(403).json({ error: 'You do not have permission to operate this virtual machine' });
    }

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

export default router;