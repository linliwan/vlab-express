import axios from 'axios';
import https from 'https';
import { vcenter } from '../config.js';

class TokenManager {
  constructor() {
    this.baseURL = vcenter.baseURL;
    this.username = vcenter.username;
    this.password = vcenter.password;
    this.token = null;
    this.tokenExpiry = null;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      httpsAgent: new https.Agent({rejectUnauthorized: false}),
      timeout: 5000,
      // axios will automatically manage the Content-Type and Accept headers, in most cases, you do not need to explicitly set these headers
      // headers: {
      //   'Content-Type': 'application/json',
      //   'Accept': 'application/json'
      // },
      proxy: false // Disable proxy, if npm sets a proxy, the proxy will affect the behavior of axios
    });
  }

  async getToken() {
    if (!this.token || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.token;
  }

  async refreshToken() {
    try {
      const response = await this.axiosInstance.post('/api/session', {},
        {auth: {username: this.username, password: this.password}}
      );
      this.token = response.data;
      this.tokenExpiry = Date.now() + 300000; // 300 seconds update the token
      // console.log('Successfully refreshed the token');
    } catch (error) {
      console.error('Failed to get session token:', error);
      throw error;
    }
  }

  isTokenExpired() {
    return Date.now() > this.tokenExpiry;
  }
}

export default TokenManager;