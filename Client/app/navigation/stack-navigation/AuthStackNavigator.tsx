import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../../components/ui/screen/LoginScreen';
import SignUpScreen from '../../../components/ui/screen/SignUpScreen';

const Stack = createStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
