import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import AttendanceToggle from '../components/AttendanceToggle';

export default function TakeAttendanceScreen({ route, navigation }) {
  const { classId } = route.params;
  const { students, currentAttendance, setCurrentAttendance, takeAttendance } = useContext(AppContext);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false); // New loading state
  
  const classStudents = students[classId] || [];

  useEffect(() => {
    // Initialize attendance for all students as present when the screen loads
    const initialAttendance = {};
    classStudents.forEach(student => {
      initialAttendance[student.id] = true;
    });
    setCurrentAttendance(initialAttendance);
  }, [classId, students]); // Added students to dependencies to re-initialize if student list changes

  const handleSubmit = async () => {
    if (classStudents.length === 0) {
      Alert.alert('Error', 'Cannot submit attendance for an empty class.');
      return;
    }
    
    setLoading(true);
    
    try {
      // takeAttendance is an asynchronous operation (for real-world data saving)
      const success = await takeAttendance(classId, date);
      
      if (success) {
        Alert.alert('Success', 'Attendance recorded successfully!');
        navigation.goBack();
      } else {
        // If the context function returns false or implicitly fails
        Alert.alert('Submission Failed', 'An error occurred while recording attendance. Please try again.');
      }
    } catch (error) {
      console.error('Attendance submission error:', error);
      Alert.alert('Error', 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take Attendance</Text>
      <Text style={styles.date}>Date: {date}</Text>
      
      {classStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students in this class. Add students from the Class Detail screen.</Text>
        </View>
      ) : (
        <ScrollView style={styles.studentList}>
          {classStudents.map(student => (
            <AttendanceToggle
              key={student.id}
              student={student}
              isPresent={!!currentAttendance[student.id]} // Ensure boolean check
              onToggle={() => toggleAttendance(student.id)}
              disabled={loading} // Disable toggles while submitting
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading || classStudents.length === 0}
      >
        {loading ? (
            <ActivityIndicator color="white" />
        ) : (
            <Text style={styles.submitButtonText}>Submit Attendance</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  date: { fontSize: 16, marginBottom: 20, color: 'gray', fontWeight: '500' },
  studentList: { 
    flex: 1, 
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  }
});
