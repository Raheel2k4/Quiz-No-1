import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';
// Ensure AttendanceToggle component is available in ../components/AttendanceToggle
import AttendanceToggle from '../components/AttendanceToggle';

export default function TakeAttendanceScreen({ route, navigation }) {
  const { classId } = route.params;
  const { students, takeAttendance, loading } = useContext(AppContext);
  const classStudents = students[classId] || [];

  // State to track attendance for the current session: { studentId: boolean (true = present) }
  const [currentAttendance, setCurrentAttendance] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set the current date for the attendance record
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Effect to initialize attendance when the screen loads or classId changes
  useEffect(() => {
    // Initialize all students as PRESENT by default
    const initialAttendance = {};
    classStudents.forEach(student => {
      initialAttendance[student.id] = true;
    });
    setCurrentAttendance(initialAttendance);
  }, [classId, students]); // Reruns if classId or students data changes

  const toggleAttendance = (studentId) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    if (classStudents.length === 0) {
      Alert.alert('Cannot Submit', 'Please add students to this class before taking attendance.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the context function to process and save the attendance data
      takeAttendance(classId, date, currentAttendance);
      
      Alert.alert('Success', `Attendance for ${date} recorded successfully!`);
      
      // Navigate back to the Class Detail screen
      navigation.goBack();
      
    } catch (error) {
      console.error("Error submitting attendance:", error);
      Alert.alert('Error', 'Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading class data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Take Attendance</Text>
            <Text style={styles.dateLabel}>Session Date: <Text style={styles.dateValue}>{date}</Text></Text>
        </View>
        
        <ScrollView style={styles.studentList}>
          {classStudents.map(student => (
            <AttendanceToggle
              key={student.id}
              student={student}
              // Check if the student ID exists in currentAttendance state, default to true if missing
              isPresent={currentAttendance[student.id] !== undefined ? currentAttendance[student.id] : true}
              onToggle={() => toggleAttendance(student.id)}
            />
          ))}
          {classStudents.length === 0 && (
             <Text style={styles.emptyText}>No students in this class. Add some from the Class Detail screen!</Text>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting || classStudents.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F7F9FC' 
  },
  container: { 
    flex: 1, 
    padding: 20,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#007AFF' 
  },
  dateLabel: { 
    fontSize: 16, 
    color: '#64748B' 
  },
  dateValue: {
    fontWeight: '600',
    color: '#333'
  },
  studentList: {
    flex: 1,
    paddingVertical: 10,
  },
  submitButton: { 
    backgroundColor: '#34C759', // Green for Submit
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0D8B4',
  },
  submitButtonText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 18 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  }
});
