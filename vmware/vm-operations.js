import ApiClient from './api-client.js';

const client = new ApiClient();

export async function getVMList(folders = null) {
  try {
    let url = '/api/vcenter/vm';
    if (folders) {
      if (Array.isArray(folders)) {
        // If folders is an array, process multiple folders
        const folderParams = folders.map(folder => `folders=${encodeURIComponent(folder)}`).join('&');
        url += `?${folderParams}`;
      } else if (typeof folders === 'string') {
        // If folders is a string, process single folder
        url += `?folders=${encodeURIComponent(folders)}`;
      }
    }
    const response = await client.get(url);
    return response;
  } catch (error) {
    console.error('Failed to get virtual machine list:', {message: error.message});
    throw new Error(`Failed to get virtual machine list: ${error.message}`);
  }
}

export async function getVMDetails(vmId) {
  try {
    const response = await client.get(`/api/vcenter/vm/${vmId}`);
    return response;
  } catch (error) {
    console.error(`Failed to get VM ${vmId} details:`, error.message);
    throw new Error(`Unable to get VM ${vmId} details`);
  }
}

export async function getPowerState(vmId) {
  try {
    const response = await client.get(`/api/vcenter/vm/${vmId}/power`);
    return response;
  } catch (error) {
    console.error(`Failed to get VM ${vmId} power state:`, error.message);
    // Return an object with unknown state instead of throwing an exception
    return { state: 'UNKNOWN', error: error.message };
  }
}

export async function setPowerState(vmId, state) {
  try {
    // Log operation start immediately
    console.log(`Starting ${state} operation for VM ${vmId}`);
    
    // Execute API call in background without waiting for result
    setTimeout(async () => {
      try {
        await client.post(`/api/vcenter/vm/${vmId}/power?action=${state}`);
        console.log(`VM ${vmId} ${state} operation completed successfully`);
      } catch (error) {
        console.error(`No response received from vCenter for VM ${vmId} ${state} operation, this may be normal`);
      }
    }, 0);
    
    // Return success status immediately without waiting for vCenter operation to complete
    return { 
      success: true, 
      message: `VM ${vmId} ${state} operation has been submitted` 
    };
    
  } catch (error) {
    console.error(`Failed to set VM ${vmId} state to ${state}:`, error.message);
    // Return a response even if there's an error
    return { 
      success: false, 
      message: `Unable to set VM ${vmId} state to ${state}: ${error.message}` 
    };
  }
}

export async function deleteVM(vmId) {
  console.log(`Starting deletion of VM ${vmId}`);
  try {
      await client.delete(`/api/vcenter/vm/${vmId}`);
      console.log(`VM ${vmId} has been deleted`);
      return { success: true, message: `VM ${vmId} has been deleted` };
  } catch (error) {
    console.error(`No response received from vCenter for VM ${vmId} deletion, this may be normal`);
    throw new Error(`Unable to delete VM ${vmId}`);
  }
}

export async function cloneVM(cloneSpec) {
  try {  
    // Create a new ApiClient instance specifically for clone operation
    const cloneClient = new ApiClient();
    // Set timeout to 2 minutes (120000 milliseconds)
    cloneClient.setTimeout(120000);
    // Use this specifically configured client to send the request
    const response = await cloneClient.post(`/api/vcenter/vm?action=clone`, cloneSpec);
    return { success: true, message: 'VM clone successful', clonedVmId: response };
  } catch (error) {
    console.error(`Failed to clone VM:`, error.message);
    throw new Error(`Unable to clone VM: ${error.message}`);
  }
}

export async function getVMConsoleTicket(vmId) {
  try {
    const body = {spec: {type: "WEBMKS"}};
    const response = await client.post(`/rest/vcenter/vm/${vmId}/console/tickets`, body);
    return response;
  } catch (error) {
    console.error(`Failed to get VM ${vmId} console ticket:`, error);
    throw new Error(`Unable to get VM ${vmId} console ticket`);
  }
}