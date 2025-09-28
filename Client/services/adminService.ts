import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URLS = [
  'http://localhost:3000/api/admin',
  'http://192.168.1.100:3000/api/admin',
  'http://10.0.0.2:3000/api/admin',
];

class AdminService {
  async adminLogin(username: string, password: string) {
    let lastError: any;

    // Try each URL until one works
    for (const baseUrl of API_URLS) {
      try {
        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store admin token
        await AsyncStorage.setItem('adminToken', data.token);
        await AsyncStorage.setItem('adminData', JSON.stringify(data.admin));
        await AsyncStorage.setItem('adminApiUrl', baseUrl);

        return data;
      } catch (error: any) {
        console.error(`Admin login error with ${baseUrl}:`, error);
        lastError = error;
        // Continue to next URL
      }
    }

    // If all URLs failed, throw the last error
    throw lastError || new Error('Unable to connect to admin service');
  }

  async getDashboardStats() {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const baseUrl = await AsyncStorage.getItem('adminApiUrl') || API_URLS[0];
      
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      return data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getAdminData() {
    try {
      const adminData = await AsyncStorage.getItem('adminData');
      return adminData ? JSON.parse(adminData) : null;
    } catch (error) {
      console.error('Get admin data error:', error);
      return null;
    }
  }

  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      return !!token;
    } catch (error) {
      console.error('Check login status error:', error);
      return false;
    }
  }
}

export default new AdminService();