import axios from 'axios';
import https from 'https';
import TokenManager from './token-manager.js';
import { vcenter } from '../config.js';

class ApiClient {
  constructor() {
    this.baseURL = vcenter.baseURL;
    this.tokenManager = new TokenManager();
    this.timeout = 15000; // Default 15 seconds timeout
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      httpsAgent: new https.Agent({rejectUnauthorized: false}),
      timeout: this.timeout,
      proxy: false // Disable proxy
    });
  }

  setTimeout(ms) {
    this.timeout = ms;
    // Update axiosInstance timeout settings
    this.axiosInstance.defaults.timeout = ms;
    return this;
  }

  async request(method, url, data = null) {
    try {
      const token = await this.tokenManager.getToken();
      const config = {
        method,
        url,
        headers: {
          'vmware-api-session-id': token
        },
        data
        // By default, axios only considers 2xx status codes as success,
        // The following function indicates that status codes between 200 and 499 are considered "success"
        // validateStatus: function (status) {
        //   return status >= 200 && status < 500;
        // }
      };
      const response = await this.axiosInstance(config);
      // console.log(`Received response from vCenter, status code: ${response.status}`);
      return response.data;
    } catch (error) {
      // if (error.response) {
      //   console.error('API request failed - server response:', {
      //     status: error.response.status,
      //     statusText: error.response.statusText,
      //     headers: error.response.headers,
      //     data: error.response.data,
      //     url: url,
      //     method: method
      //   });
      // } else if (error.request) {
      //   console.error('API request failed - no response:', {
      //     request: error.request,
      //     url: url,
      //     method: method
      //   });
      // } else {
      //   console.error('API request failed:', {
      //     message: error.message,
      //     url: url,
      //     method: method
      //   });
      // }
      throw error;
    }
  }


  async get(url) {
    return this.request('GET', url);
  }

  async post(url, data) {
    return this.request('POST', url, data);
  }

  async put(url, data) {
    return this.request('PUT', url, data);
  }

  async patch(url, data) {
    return this.request('PATCH', url, data);
  }

  async delete(url) {
    return this.request('DELETE', url);
  }
}

export default ApiClient;
