import React, { useContext } from 'react';
// FIX: Alert has been added to the import list from react-native.
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function ClassDetailScreen({ route, navigation }) {
    const { classId, className } = route.params;
    const { classes, loading } = useContext(AppContext);

    // Find the latest class data, ensuring we compare numbers with numbers.
    const currentClass = classes.find(c => c.id === Number(classId));

    // If the class data isn't available yet (e.g., still loading), show an indicator.
    if (!currentClass) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4C51BF" />
            </SafeAreaView>
        );
    }
    
    // Safely convert attendanceRate to a number and provide a default of 0.
    const attendanceRate = Number(currentClass.attendanceRate || 0);

    // Determine color for attendance rate based on the numeric percentage.
    const rateColor = attendanceRate >= 90 
        ? '#34C759' // Green for excellent
        : attendanceRate >= 70
        ? '#FF9500' // Orange for moderate
        : '#FF3B30'; // Red for poor

    const navigateToStudents = () => {
        navigation.navigate('Students', { classId, className });
    };

    const navigateToAttendance = () => {
        if (currentClass.students === 0) {
            // This Alert call is now valid because Alert has been imported.
            Alert.alert('Cannot take attendance', 'Please enroll students in this class first.');
            return;
        }
        navigation.navigate('TakeAttendance', { classId, className });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.mainContent}>
                    
                    <Text style={styles.title}>{className} Overview</Text>
                    <Text style={styles.description}>Manage students, track performance, and record attendance.</Text>

                    {/* Stats Container */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="people-circle-outline" size={32} color="#4C51BF" style={styles.statIcon} />
                            <View>
                                <Text style={styles.statValue}>{currentClass.students}</Text>
                                <Text style={styles.statLabel}>Students</Text>
                            </View>
                        </View>

                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-done-circle-outline" size={32} color={rateColor} style={styles.statIcon} />
                            <View>
                                <Text style={[styles.statValue, { color: rateColor }]}>
                                    {/* Using the safe, numeric attendanceRate variable here */}
                                    {attendanceRate.toFixed(1)}%
                                </Text>
                                <Text style={styles.statLabel}>Attendance Rate</Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions Container */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={navigateToStudents}
                            disabled={loading}
                        >
                            <Ionicons name="list-outline" size={24} color="white" />
                            <Text style={styles.actionButtonText}>View & Manage Students</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.secondaryActionButton]} 
                            onPress={navigateToAttendance}
                            disabled={loading}
                        >
                            <Ionicons name="calendar-outline" size={24} color="#4C51BF" />
                            <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Take Attendance</Text>
                        </TouchableOpacity>
                    </View>
                
                    {loading && (
                        <ActivityIndicator size="large" color="#4C51BF" style={{ marginTop: 20 }} />
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    scrollContainer: {
        flex: 1,
    },
    mainContent: {
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    statIcon: {
        marginRight: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    actionsContainer: {
        marginBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 15,
        backgroundColor: '#4C51BF',
        marginBottom: 15,
        shadowColor: '#4C51BF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
    secondaryActionButton: {
        backgroundColor: '#EBF4FF',
        shadowColor: 'transparent',
        elevation: 0,
    },
    secondaryActionButtonText: {
        color: '#4C51BF',
    }
});

