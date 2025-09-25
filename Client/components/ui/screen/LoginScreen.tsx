import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { COLOR } from '../../../constants/ColorPallet';
import adminService from '../../../services/adminService';

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('handleLogin called');
    
    setIsLoading(true);
    try {
      if (isAdminLogin) {
        // Admin login
        console.log('Attempting admin login with', formData.email, formData.password);
        const result = await adminService.adminLogin(formData.email, formData.password);
        console.log('Admin login result:', result);
        
        if (result.success) {
          // Navigate to admin dashboard immediately
          navigation.navigate('AdminDashboard');
          // Optional: Show a brief success message without blocking navigation
          Alert.alert('Success', 'Welcome to Admin Dashboard!');
        }
      } else {
        // Regular user login
        console.log('Calling login with', formData.email, formData.password);
        const result = await login(formData.email, formData.password);
        console.log('Login result:', result);
        // No need to navigate manually - AuthNavigator will handle this automatically
        // when isAuthenticated becomes true
      }

    } catch (error: any) {
      console.log('Login error:', error);
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUpPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SignUp');
    }
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Admin Login Toggle */}
            <TouchableOpacity
              style={styles.adminToggle}
              onPress={() => setIsAdminLogin(!isAdminLogin)}
            >
              <View style={[styles.checkbox, isAdminLogin && styles.checkboxActive]}>
                {isAdminLogin && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.adminToggleText}>Admin Login</Text>
            </TouchableOpacity>

            {/* Email/Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {isAdminLogin ? 'Username' : 'Email'}
              </Text>
              <TextInput
                  style={styles.input}
                  placeholder={isAdminLogin ? 'Enter username' : 'Enter your email'}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType={isAdminLogin ? 'default' : 'email-address'}
                  autoCapitalize="none"
                  autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
            >
              {isLoading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={handleSignUpPress}>
                <Text style={styles.signUpLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLOR.light.black || '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.light.black || '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: COLOR.light.orange || '#ff6b35',
    fontWeight: '600',
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
    borderColor: COLOR.light.orange || '#ff6b35',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default LoginScreen;