import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import DealersScreen from './screens/DealersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"     component={SplashScreen} />
        <Stack.Screen name="Login"      component={LoginScreen} />
        <Stack.Screen name="Register"   component={RegisterScreen} />
        <Stack.Screen name="Dashboard"  component={DashboardScreen} />
        <Stack.Screen name="Dealers"    component={DealersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
