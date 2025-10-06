import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import ClassCard from '../components/ClassCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';

export default function DashboardScreen({ navigation }) {
  const { classes, user, addClass } = useContext(AppContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0);

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name.');
      return;
    }
    
    addClass(newClassName.trim());

    setNewClassName('');
    setIsModalVisible(false);
  };

  const renderItem = ({ item }) => <ClassCard classItem={item} onPress={() => navigation.navigate('ClassDetail', { classId: item.id })} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Dashboard" navigation={navigation} />

      <View style={styles.container}>

        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Ionicons name="stats-chart" size={28} color="#007AFF" style={styles.overviewIcon} />
          <Text style={styles.overviewTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{classes.length}</Text>
              <Text style={styles.statLabel}>Total Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
          </View>
        </View>

        {/* Action Button: View Reports */}
        <TouchableOpacity 
          style={styles.reportButton} 
          onPress={() => navigation.navigate('Reports')}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#FFFFFF" />
          <Text style={styles.reportButtonText}>View Attendance Reports</Text>
        </TouchableOpacity>

        {/* Your Classes Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="school-outline" size={24} color="#333" />
          <Text style={styles.sectionTitle}>Your Classes</Text>
        </View>

        <FlatList
          data={classes}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={<Text style={styles.emptyList}>No classes found. Add a class below!</Text>}
        />

        {/* Add Class Button - NOW OPENS MODAL */}
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add New Class</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Class Name"
              value={newClassName}
              onChangeText={setNewClassName}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddClass}
              >
                <Text style={styles.buttonText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  overviewCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  overviewIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});