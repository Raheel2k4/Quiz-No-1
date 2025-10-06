import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import Header from '../components/Header';

const ReportCard = ({ classReport }) => {
  const rateColor = classReport.presentRate >= 90 
    ? '#34C759'
    : classReport.presentRate >= 70
    ? '#FF9500'
    : '#FF3B30';

  return (
    <View style={styles.reportCard}>
      <Text style={styles.className}>{classReport.name}</Text>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Total Students:</Text>
        <Text style={styles.statValue}>{classReport.totalStudents}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Total Sessions Recorded:</Text>
        <Text style={styles.statValue}>{classReport.totalSessions}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Overall Attendance Rate:</Text>
        <Text style={[styles.statValue, { color: rateColor }]}>{classReport.presentRate}%</Text>
      </View>
    </View>
  );
};

export default function ReportsScreen({ navigation }) {
  const { classes, attendance, students, loading } = useContext(AppContext);

  const getClassReport = (classItem) => {
    const classAtt = attendance[classItem.id] || [];
    const totalStudents = students[classItem.id]?.length || 0;
    
    const uniqueDates = new Set(classAtt.map(att => att.date));
    const totalSessions = uniqueDates.size;
    
    const totalPresent = classAtt.filter(att => att.present).length;
    const totalRecords = classAtt.length;
    const presentRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    return {
      name: classItem.name,
      totalStudents,
      totalSessions,
      presentRate,
    };
  };

  const reportsData = classes.map(getClassReport);

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Attendance Reports" navigation={navigation} />
      <View style={styles.container}>
        <FlatList
          data={reportsData}
          renderItem={({ item }) => <ReportCard classReport={item} />}
          keyExtractor={item => item.name}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No reports to display. Add classes and take attendance to generate reports.</Text>}
        />
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
  },
  listContent: { 
    padding: 20,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#64748B',
  },
});