import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext'; 

export default function ProfileScreen({ navigation }) {
  const { user, logout, displayName } = useContext(AppContext);

  const handleLogout = () => {
    if (logout) {
      logout();
      navigation.replace('Login'); 
    } else {
      console.warn("Logout function not fully implemented in AppContext yet.");
      navigation.replace('Login'); 
    }
  };

  const profileName = displayName || 'Instructor Name';
  const userEmail = user?.email || 'instructor@university.edu'; 

  const settingsItems = [
    { name: "Change Password", icon: "lock-closed-outline", action: () => console.log('Change Password') },
    { name: "Notification Settings", icon: "notifications-outline", action: () => console.log('Notifications') },
    { name: "Help & Support", icon: "help-circle-outline", action: () => console.log('Help') },
    { name: "About App", icon: "information-circle-outline", action: () => console.log('About') },
  ];

  const renderSettingItem = (item, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.settingItem} 
      onPress={item.action}
    >
      <Ionicons name={item.icon} size={22} color="#007AFF" style={styles.settingIcon} />
      <Text style={styles.settingText}>{String(item.name)}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Profile</Text>
          <View style={styles.backButton} /> {/* Spacer */}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Ionicons name="person-circle-outline" size={80} color="#007AFF" style={styles.profileIcon} />
          <Text style={styles.profileName}>{String(profileName)}</Text>
          <Text style={styles.profileEmail}>{String(userEmail)}</Text>

          <TouchableOpacity style={styles.editButton} onPress={() => console.log('Edit Profile')}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          {settingsItems.map(renderSettingItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 50,
    backgroundColor: '#f5f5f5' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileIcon: {
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoutButtonText: {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18,
    marginLeft: 8,
  },
});
