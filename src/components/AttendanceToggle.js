import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AttendanceToggle({ student, isPresent, onToggle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.studentName}>{student.name}</Text>
      <TouchableOpacity 
        style={[styles.toggle, isPresent ? styles.present : styles.absent]}
        onPress={onToggle}
      >
        <Text style={styles.toggleText}>
          {isPresent ? 'Present' : 'Absent'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center'
  },
  present: {
    backgroundColor: '#34C759'
  },
  absent: {
    backgroundColor: '#FF3B30'
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});