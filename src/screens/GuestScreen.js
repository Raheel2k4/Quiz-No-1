import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GuestScreen({ navigation }) {
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToDashboard = () => {
    // Navigate to the main app dashboard for local/guest data storage.
    // The AppContext logic will need to be updated to handle guest mode.
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
            <Text style={styles.loginButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Ionicons name="person-circle-outline" size={150} color="#007AFF" />
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Manage your classes and students with local data.
          </Text>
          <Text style={styles.subtitle}>
            Log in to save your data to the cloud.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.guestButton} 
          onPress={navigateToDashboard}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 5,
  },
  guestButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  guestButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});