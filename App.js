import React, { useContext } from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppContextProvider, AppContext } from './src/context/AppContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ClassesScreen from './src/screens/ClassesScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ClassDetailScreen from './src/screens/ClassDetailScreen';
import StudentsScreen from './src/screens/StudentsScreen';
import TakeAttendanceScreen from './src/screens/TakeAttendanceScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ClassReportsScreen from './src/screens/ClassReportsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const PRIMARY_COLOR = '#4C51BF';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Classes') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
    const { user, isAuthReady } = useContext(AppContext);

    if (!isAuthReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {user ? (
                <>
                    <Stack.Screen 
                        name="Main" 
                        component={MainTabs} 
                        options={({ route }) => {
                            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Dashboard';
                            const shouldShowHeader = routeName === 'Classes' || routeName === 'Reports';
                            
                            return {
                                headerShown: shouldShowHeader,
                                title: routeName,
                                headerStyle: { backgroundColor: PRIMARY_COLOR },
                                headerTintColor: '#ffffff',
                                headerTitleStyle: { fontWeight: 'bold' },
                            };
                        }}
                    />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: 'Class Details' }} />
                    <Stack.Screen name="Students" component={StudentsScreen} options={{ title: 'Manage Students' }} />
                    <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} options={{ title: 'Take Attendance' }} />
                    <Stack.Screen name="ClassReports" component={ClassReportsScreen} options={{ title: 'Detailed Report' }} />
                    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AppContextProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </AppContextProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
});

