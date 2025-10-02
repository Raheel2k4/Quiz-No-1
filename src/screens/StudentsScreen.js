import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import StudentCard from '../components/StudentCard';

export default function StudentsScreen({ route }) {
  const { classId } = route.params;
  // Assumes deleteStudent is available in AppContext and handles API call
  const { students, deleteStudent } = useContext(AppContext); 
  const classStudents = students[classId] || [];
  const [loading, setLoading] = useState(false);

  const handleDeleteStudent = (studentId, studentName) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove ${studentName} from this class? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
                // deleteStudent is assumed to handle the API call and state update
                const success = await deleteStudent(classId, studentId);
                if (!success) {
                    Alert.alert('Error', `Failed to remove ${studentName}.`);
                }
            } catch (error) {
                console.error('Student deletion error:', error);
                Alert.alert('Error', 'An unexpected network error occurred during deletion.');
            } finally {
                setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <StudentCard 
        student={item} 
        // Pass the deletion handler with student details
        onDelete={() => handleDeleteStudent(item.id, item.name)} 
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students in Class</Text>
      <Text style={styles.count}>{classStudents.length} students</Text>
      
      {/* Show a global loading indicator */}
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />}

      <FlatList
        data={classStudents}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        scrollEnabled={!loading} 
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  count: { fontSize: 16, marginBottom: 20, color: 'gray' },
  list: { flex: 1 },
  loadingIndicator: {
    marginVertical: 10,
  }
});
