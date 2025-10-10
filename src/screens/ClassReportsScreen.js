import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

// --- Reusable Components ---

// Renders each student's attendance status row
const AttendanceItem = ({ name, present }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.studentName}>{name}</Text>
    <View style={[styles.statusBadge, present ? styles.presentBadge : styles.absentBadge]}>
      <Text style={[styles.statusText, present ? styles.presentText : styles.absentText]}>
        {present ? 'Present' : 'Absent'}
      </Text>
    </View>
  </View>
);

// Renders the pressable header for each date section
const SectionHeader = ({ title, isExpanded, onPress }) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onPress}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
    <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#4C51BF" />
  </TouchableOpacity>
);


export default function ClassReportsScreen({ route }) {
  const { classId } = route.params;
  const { students, attendance, loading } = useContext(AppContext);
  const [expandedSection, setExpandedSection] = useState(null);

  // Memoize the data processing to prevent recalculating on every render
  const reportData = useMemo(() => {
    const classIdStr = String(classId);
    const classStudents = students[classIdStr] || [];
    const classAttendance = attendance[classIdStr] || [];

    if (classStudents.length === 0 || classAttendance.length === 0) return [];

    const studentMap = classStudents.reduce((acc, student) => {
      acc[student.id] = student.name;
      return acc;
    }, {});

    const groupedByDate = classAttendance.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push({
        studentName: studentMap[record.studentId] || 'Unknown Student',
        present: record.present,
      });
      return acc;
    }, {});

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        title: dayjs(date).format('MMMM D, YYYY'),
        data: data,
      }))
      .sort((a, b) => new Date(b.title) - new Date(a.title));
  }, [classId, students, attendance]);

  // Function to toggle which section is expanded
  const handleToggleSection = (title) => {
    setExpandedSection(current => (current === title ? null : title));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4C51BF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionList
        sections={reportData}
        keyExtractor={(item, index) => item.studentName + index}
        renderItem={({ item, section }) => {
          // Only render items for the expanded section
          if (section.title !== expandedSection) return null;
          return <AttendanceItem name={item.studentName} present={item.present} />;
        }}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            title={section.title}
            isExpanded={expandedSection === section.title}
            onPress={() => handleToggleSection(section.title)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No attendance records found for this class.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    // Indent the items slightly
    paddingLeft: 20,
  },
  studentName: {
    fontSize: 16,
    color: '#4A5568',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  presentBadge: {
    backgroundColor: '#C6F6D5',
  },
  absentBadge: {
    backgroundColor: '#FED7D7',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  presentText: {
    color: '#2F855A',
  },
  absentText: {
    color: '#C53030',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});

