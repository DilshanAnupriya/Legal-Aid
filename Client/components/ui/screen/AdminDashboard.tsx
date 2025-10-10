
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLOR } from '../../../constants/ColorPallet';

interface AdminDashboardProps {
  navigation?: any;
}

interface AdminStats {
  users: {
    total: number;
    lawyers: number;
    ngos: number;
    active: number;
  };
  recentUsers: any[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const [adminData, setAdminData] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
    fetchDashboardStats();
  }, []);

  const loadAdminData = async () => {
    try {
      const adminDataString = await AsyncStorage.getItem('adminData');
      if (adminDataString) {
        setAdminData(JSON.parse(adminDataString));
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const baseUrl = await AsyncStorage.getItem('adminApiUrl') || 'http://localhost:3000/api/admin';
      
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

      if (response.ok && data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('handleSignOut called - Admin signout initiated');
    console.log('Admin signout confirmed - clearing data');
    try {
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminData');
      console.log('Admin data cleared, attempting navigation');
      // Navigate back to login
      if (navigation) {
        console.log('Navigation object found, resetting to Login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        console.error('Navigation object not found');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR.light.orange} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {adminData?.adminName || 'Admin'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => {
            console.log('Sign out button pressed!');
            handleSignOut();
          }} 
          style={styles.signOutButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color={COLOR.light.orange} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats?.users.total || 0}
              icon="people-outline"
              color="#3498db"
            />
            <StatCard
              title="Lawyers"
              value={stats?.users.lawyers || 0}
              icon="briefcase-outline"
              color="#e74c3c"
            />
            <TouchableOpacity
              onPress={() => {
                if (navigation) {
                  navigation.navigate('AdminNGOs');
                }
              }}
            >
              <StatCard
                title="NGOs"
                value={stats?.users.ngos || 0}
                icon="business-outline"
                color="#2ecc71"
              />
            </TouchableOpacity>
            <StatCard
              title="Active Users"
              value={stats?.users.active || 0}
              icon="checkmark-circle-outline"
              color="#f39c12"
            />
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {stats?.recentUsers.map((user, index) => (
            <View key={index} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View>
                  <Text style={styles.userName}>
                    {user.firstName || user.organizationName || user.email}
                  </Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user.status === 'active' ? '#2ecc71' : '#95a5a6' }
                ]}>
                  <Text style={styles.statusText}>{user.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature', 'User management coming soon!')}
          >
            <Ionicons name="people" size={20} color={COLOR.light.orange} />
            <Text style={styles.actionButtonText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (navigation) {
                navigation.navigate('AdminManageLawyers');
              }
            }}
          >
            <Ionicons name="people" size={20} color={COLOR.light.orange} />
            <Text style={styles.actionButtonText}>Manage Lawyers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (navigation) {
                navigation.navigate('AdminNGOs');
              }
            }}
          >
            <Ionicons name="business" size={20} color={COLOR.light.orange} />
            <Text style={styles.actionButtonText}>Manage NGOs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature', 'Analytics coming soon!')}
          >
            <Ionicons name="analytics" size={20} color={COLOR.light.orange} />
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminIconContainer: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLOR.light.orange || '#ff6b35',
  },
  signOutText: {
    marginLeft: 5,
    color: COLOR.light.orange || '#ff6b35',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default AdminDashboard;

