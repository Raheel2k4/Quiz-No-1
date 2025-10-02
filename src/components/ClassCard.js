import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ClassCard({ classItem, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.className}>{classItem.name}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>Students: {classItem.students}</Text>
        <Text style={[styles.stat, styles.rate]}>
          Attendance: {classItem.attendanceRate}%
        </Text>
      </View>
    </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF'
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    fontSize: 14,
    color: 'gray'
  },
  rate: {
    fontWeight: 'bold',
    color: '#34C759'
  }
});