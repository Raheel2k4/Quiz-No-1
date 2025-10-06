import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppContextProvider } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ClassesScreen from './src/screens/ClassesScreen';
import ClassDetailScreen from './src/screens/ClassDetailScreen';
import StudentsScreen from './src/screens/StudentsScreen';
import TakeAttendanceScreen from './src/screens/TakeAttendanceScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define the primary color for consistent theming
const PRIMARY_COLOR = '#4C51BF';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Ensure the tab bar uses the primary purple color
        tabBarActiveTintColor: PRIMARY_COLOR, 
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            // --- Global Header Styling for screens not using the custom Header component ---
            headerStyle: {
              backgroundColor: PRIMARY_COLOR, // Apply the purple background
            },
            headerTintColor: '#ffffff', // Set text color (title and back button) to white
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            // --- End Global Header Styling ---
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          
          {/* Note: Profile, ClassDetail, Students, and TakeAttendance use the custom header, 
              but we keep the Stack header for consistency or if we switch back. 
              The custom Header.js is typically mounted directly in these screens' JSX. */}
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

          {/* Use the built-in stack header for these screens and style it to match the custom header color */}
          <Stack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: 'Class Details' }} />
          <Stack.Screen name="Students" component={StudentsScreen} options={{ title: 'Students' }} />
          <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} options={{ title: 'Take Attendance' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContextProvider>
  );
}
