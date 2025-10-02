import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ReportsScreen() {
  const { classes, attendance, students } = useContext(AppContext);

  const getClassReport = (classItem) => {
    const classAtt = attendance[classItem.id] || [];
    const totalStudents = students[classItem.id]?.length || 0;
    const totalSessions = Math.max(1, classAtt.length / totalStudents);
    
    return {
      ...classItem,
      totalSessions: Math.round(totalSessions),
      presentRate: classItem.attendanceRate || 0
    };
  };

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.className}>{item.name}</Text>
      <Text>Students: {item.students}</Text>
      <Text>Sessions: {item.totalSessions}</Text>
      <Text>Attendance Rate: {item.presentRate}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Reports</Text>
      <FlatList
        data={classes.map(getClassReport)}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' },
  list: { flex: 1 },
  reportCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  className: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#007AFF' }
});