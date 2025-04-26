import ApiClient from './api-client.js';

const client = new ApiClient();

export async function getFolders() {
  try {
    const response = await client.get('/api/vcenter/folder');
    return response;
  } catch (error) {
    console.error('Failed to get folder list:', error.message);
    throw new Error('Unable to get folder list');
  }
}

export async function getDatastores() {
  try {
    const response = await client.get('/api/vcenter/datastore');
    return response;
  } catch (error) {
    console.error('Failed to get datastore list:', error.message);
    throw new Error('Unable to get datastore list');
  }
}

export async function getHosts() {
  try {
    const response = await client.get('/api/vcenter/host');
    return response;
  } catch (error) {
    console.error('Failed to get host list:', error.message);
    throw new Error('Unable to get host list');
  }
}

export async function getClusters() {
  try {
    const response = await client.get('/api/vcenter/cluster');
    return response;
  } catch (error) {
    console.error('Failed to get cluster list:', error.message);
    throw new Error('Unable to get cluster list');
  }
}

export async function getDatacenters() {
  try {
    const response = await client.get('/api/vcenter/datacenter');
    return response;
  } catch (error) {
    console.error('Failed to get datacenter list:', error.message);
    throw new Error('Unable to get datacenter list');
  }
}


export async function getNetworks() {
  try {
    const response = await client.get('/api/vcenter/network');
    return response;
  } catch (error) {
    console.error('Failed to get network list:', error.message);
    throw new Error('Unable to get network list');
  }
}

export async function getResourcePools() {
  try {
    const response = await client.get('/api/vcenter/resource-pool');
    return response;
  } catch (error) {
    console.error('Failed to get resource pool list:', error.message);
    throw new Error('Unable to get resource pool list');
  }
}