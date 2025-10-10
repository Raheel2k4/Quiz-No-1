import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';
import AttendanceToggle from '../components/AttendanceToggle';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from 'dayjs';

export default function TakeAttendanceScreen({ route, navigation }) {
    const { classId, className } = route.params;
    const { students, attendance, takeAttendance, loading } = useContext(AppContext);
    
    const classStudents = students[classId] || [];
    const classAttendance = attendance[classId] || [];

    const [currentAttendance, setCurrentAttendance] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const loadAttendanceForDate = useCallback((selectedDate) => {
        const dateString = dayjs(selectedDate).format('YYYY-MM-DD');
        const attendanceForDay = classAttendance.filter(att => att.date.startsWith(dateString));

        if (attendanceForDay.length > 0) {
            const initialAttendance = {};
            classStudents.forEach(student => {
                const record = attendanceForDay.find(rec => rec.studentId === student.id);
                initialAttendance[student.id] = record ? record.present : true;
            });
            setCurrentAttendance(initialAttendance);
        } else {
            const initialAttendance = {};
            classStudents.forEach(student => {
                initialAttendance[student.id] = true;
            });
            setCurrentAttendance(initialAttendance);
        }
    }, [classAttendance, classStudents]);

    useEffect(() => {
        loadAttendanceForDate(date);
    }, [date, loadAttendanceForDate]);

    const toggleAttendance = (studentId) => {
        setCurrentAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const handleConfirmDate = (selectedDate) => {
        setDatePickerVisibility(false);
        setDate(selectedDate);
    };

    const handleSubmit = async () => {
        if (isSubmitting || classStudents.length === 0) return;
        
        setIsSubmitting(true);
        const dateString = dayjs(date).format('YYYY-MM-DD');
        
        // Await the attendance call
        const { success } = await takeAttendance(classId, dateString, currentAttendance);
        
        // FIX: Stop the loading indicator immediately after the await is finished.
        setIsSubmitting(false);

        // THEN, handle the navigation and alert after the state has been updated.
        if (success) {
            Alert.alert('Success', `Attendance for ${dateString} has been recorded.`);
            navigation.goBack();
        }
    };

    if (loading && classStudents.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4C51BF" />
                <Text style={styles.emptyText}>Loading Students...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>{className}</Text>

                <TouchableOpacity style={styles.datePickerButton} onPress={() => setDatePickerVisibility(true)}>
                    <Ionicons name="calendar-outline" size={24} color="#4C51BF" />
                    <Text style={styles.dateValue}>{dayjs(date).format('MMMM D, YYYY')}</Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={() => setDatePickerVisibility(false)}
                    date={date}
                />
                
                <ScrollView style={styles.studentList}>
                    {classStudents.map(student => (
                        <AttendanceToggle
                            key={student.id}
                            student={student}
                            isPresent={currentAttendance[student.id] !== undefined ? currentAttendance[student.id] : true}
                            onToggle={() => toggleAttendance(student.id)}
                        />
                    ))}
                    {classStudents.length === 0 && (
                        <Text style={styles.emptyText}>No students enrolled in this class.</Text>
                    )}
                </ScrollView>

                <TouchableOpacity 
                    style={[styles.submitButton, (isSubmitting || classStudents.length === 0) && styles.submitButtonDisabled]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting || classStudents.length === 0}
                >
                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Submit Attendance</Text>}
                </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingBottom: 50,
        paddingTop: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 20,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF4FF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    dateValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4C51BF',
        marginLeft: 10,
    },
    studentList: {
        flex: 1,
    },
    submitButton: { 
        backgroundColor: '#34C759',
        padding: 15, 
        borderRadius: 12, 
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#A0D8B4',
    },
    submitButtonText: { 
        color: 'white', 
        fontWeight: 'bold',
        fontSize: 18 
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#94A3B8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

