import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function ClassDetailScreen({ route, navigation }) {
    const { classId, className } = route.params;
    const { classes, loading } = useContext(AppContext);

    // Find the latest class data from global state
    // Note: The class list is simple, so finding by ID is efficient enough here.
    const currentClass = classes.find(c => c.id === classId) || { students: 0, attendanceRate: 0 };
    
    // Determine color for attendance rate based on percentage
    const rateColor = currentClass.attendanceRate >= 90 
        ? '#34C759' // Green for excellent
        : currentClass.attendanceRate >= 70
        ? '#FF9500' // Orange for moderate
        : '#FF3B30'; // Red for poor

    const navigateToStudents = () => {
        navigation.navigate('Students', { classId, className });
    };

    const navigateToAttendance = () => {
        // Ensure the class has students before navigating to attendance
        if (currentClass.students === 0) {
            alert('Cannot take attendance: No students enrolled in this class.');
            return;
        }
        navigation.navigate('TakeAttendance', { classId, className });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            
            {/* The custom header block that contained the redundant back button is removed. */}

            <ScrollView style={styles.scrollContainer}>
                
                <View style={styles.mainContent}>
                    
                    {/* Class Overview Section - Added the title here for context below the native header */}
                    <Text style={styles.title}>{className} Overview</Text>
                    <Text style={styles.description}>Manage students, track performance, and record attendance for this class.</Text>

                    {/* Stats Container */}
                    <View style={styles.statsContainer}>
                        
                        {/* Students Stat */}
                        <View style={styles.statItem}>
                            <Ionicons name="people-circle-outline" size={32} color="#007AFF" style={styles.statIcon} />
                            <View>
                                <Text style={styles.statValue}>{currentClass.students}</Text>
                                <Text style={styles.statLabel}>Students</Text>
                            </View>
                        </View>

                        {/* Attendance Rate Stat */}
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-done-circle-outline" size={32} color={rateColor} style={styles.statIcon} />
                            <View>
                                <Text style={[styles.statValue, { color: rateColor }]}>
                                    {currentClass.attendanceRate.toFixed(1)}%
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
                            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                            <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Take Attendance</Text>
                        </TouchableOpacity>
                    </View>
                
                    {loading && (
                        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                    )}

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC', // Light background
    },
    scrollContainer: {
        flex: 1,
    },
    mainContent: {
        padding: 20,
    },
    // --- Header Section (Now main content title) ---
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

    // --- Stats Container ---
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
        // *** ADJUSTMENTS FOR WIDER CONTENT VIEW ***
        paddingVertical: 15,
        paddingHorizontal: 10, // Reduced horizontal padding
        marginHorizontal: 4,    // Reduced margin to slightly widen the box
        // ****************************************
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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

    // --- Actions Container ---
    actionsContainer: {
        marginBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 15,
        backgroundColor: '#007AFF', // Primary color
        marginBottom: 15,
        shadowColor: '#007AFF',
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
    // Secondary button for contrast
    secondaryActionButton: {
        backgroundColor: '#E2E8F0', // Light gray background
        shadowColor: 'transparent',
        elevation: 0,
    },
    secondaryActionButtonText: {
        color: '#007AFF', // Primary color text
    }
});
