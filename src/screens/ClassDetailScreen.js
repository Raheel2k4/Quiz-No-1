import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ClassDetailScreen({ route, navigation }) {
  const { classId } = route.params;
  const { classes, students, addStudent } = useContext(AppContext);
  const cls = classes.find(c => c.id === classId);
  const classStudents = students[classId] || [];

  const [modalVisible, setModalVisible] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      Alert.alert('Error', 'Please enter both name and email.');
      return;
    }

    setLoading(true);
    const success = await addStudent(classId, studentName.trim(), studentEmail.trim());
    setLoading(false);

    if (success) {
      setStudentName('');
      setStudentEmail('');
      setModalVisible(false);
    }
    // Note: addStudent handles its own error alerts
  };

  if (!cls) return <Text style={styles.notFound}>Class not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{cls.name}</Text>
      <Text style={styles.statText}>Students: {classStudents.length}</Text>
      <Text style={styles.statText}>Attendance Rate: {cls.attendanceRate}%</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('TakeAttendance', { classId })}
        >
          <Text style={styles.buttonText}>Take Attendance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Students', { classId })}
        >
          <Text style={styles.buttonText}>View Students</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Student</Text>
      </TouchableOpacity>

      {/* Add Student Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Add New Student</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Full Name"
              value={studentName}
              onChangeText={setStudentName}
              editable={!loading}
            />
            <TextInput
              style={modalStyles.input}
              placeholder="Email Address"
              value={studentEmail}
              onChangeText={setStudentEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonClose]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={modalStyles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonAdd]}
                onPress={handleAddStudent}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={modalStyles.textStyle}>Add Student</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  notFound: { fontSize: 18, textAlign: 'center', marginTop: 50, color: 'red' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  statText: { fontSize: 18, color: '#555', marginBottom: 5 },
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15,
    marginBottom: 10,
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#95a5a6',
  },
  buttonAdd: {
    backgroundColor: '#007AFF',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
