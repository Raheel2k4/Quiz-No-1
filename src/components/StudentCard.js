import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function StudentCard({ student, onDelete }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.email}>{student.email}</Text>
      </View>
      {/* Delete Button, visible only if onDelete handler is provided */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row', // Align content and button horizontally
    justifyContent: 'space-between', // Push button to the right
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007AFF'
  },
  email: {
    fontSize: 14,
    color: 'gray'
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // Red color for delete action
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
