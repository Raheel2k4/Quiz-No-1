import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
// The custom Header component is no longer needed here.
// import Header from '../components/Header';

const ReportCard = ({ classReport, onPress }) => {
  // Safely access attendanceRate and default to 0 if it's not a valid number
  const rate = Number(classReport.presentRate) || 0;

  const rateColor = rate >= 90
    ? '#34C759' // Green
    : rate >= 70
    ? '#FF9500' // Orange
    : '#FF3B30'; // Red

  return (
    // FIX: Wrapped the card in a TouchableOpacity to make it pressable
    <TouchableOpacity style={styles.reportCard} onPress={onPress}>
      <View style={[styles.cardHeader, { backgroundColor: rateColor }]} />
      <View style={styles.cardContent}>
        <Text style={styles.className}>{classReport.name}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Students:</Text>
          <Text style={styles.statValue}>{String(classReport.totalStudents)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Sessions Recorded:</Text>
          <Text style={styles.statValue}>{String(classReport.totalSessions)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Overall Attendance Rate:</Text>
          <Text style={[styles.statValue, { color: rateColor }]}>{rate.toFixed(1)}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ReportsScreen({ navigation }) {
  const { classes, attendance, students, loading } = useContext(AppContext);

  const getClassReport = (classItem) => {
    const classIdStr = String(classItem.id);
    const classAtt = attendance[classIdStr] || [];
    const classStudents = students[classIdStr] || [];
    const totalStudents = classStudents.length;

    const uniqueDates = new Set(classAtt.map(att => att.date));
    const totalSessions = uniqueDates.size;

    const totalPresent = classAtt.filter(att => att.present).length;
    const totalRecords = classAtt.length;
    const presentRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      id: classItem.id, // FIX: Ensure the class ID is passed for navigation
      name: classItem.name,
      totalStudents,
      totalSessions,
      presentRate,
    };
  };

  const reportsData = (classes || []).map(getClassReport);

  if (loading && !reportsData.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4C51BF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* FIX: Removed the redundant <Header> component. The main navigator in App.js provides the header now. */}
      <View style={styles.container}>
        <FlatList
          data={reportsData}
          renderItem={({ item }) => (
            <ReportCard
              classReport={item}
              // FIX: Added the onPress handler to navigate to the detailed report screen
              onPress={() => navigation.navigate('ClassReports', { classId: item.id, className: item.name })}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reports to display.</Text>
                <Text style={styles.emptySubtext}>Take attendance in a class to generate a report.</Text>
            </View>
          }
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
    flexGrow: 1,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 8,
  },
  cardContent: {
    padding: 20,
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A202C'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#718096',
  }
});

