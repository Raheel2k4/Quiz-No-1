import React, { useContext, useState, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import StudentCard from '../components/StudentCard';

// Increased Height estimate for the button plus its container padding.
const BOTTOM_BUTTON_HEIGHT = 185; 

// --- Dedicated Modal Component for Enrollment ---
const AddStudentModal = memo(({
    isVisible,
    onClose,
    name,
    setName,
    registrationNumber,
    setRegistrationNumber,
    onSubmit,
    isSubmitting
}) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <KeyboardAvoidingView
            style={modalStyles.centeredView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={modalStyles.modalView}>
                <Text style={modalStyles.modalTitle}>Enroll New Student</Text>
                <TextInput
                    style={modalStyles.input}
                    placeholder="Student Name (e.g., Alice Johnson)"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoFocus={true} 
                    keyboardAppearance='light'
                />
                <TextInput
                    style={modalStyles.input}
                    placeholder="Registration Number (e.g., 2024-CS-045)"
                    value={registrationNumber}
                    onChangeText={setRegistrationNumber}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardAppearance='light'
                />
                <View style={modalStyles.buttonContainer}>
                    <TouchableOpacity
                        style={[modalStyles.button, modalStyles.cancelButton]}
                        onPress={onClose}
                        disabled={isSubmitting}
                    >
                        <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[modalStyles.button, modalStyles.submitButton]}
                        onPress={onSubmit}
                        disabled={isSubmitting || !name.trim() || !registrationNumber.trim()} 
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={modalStyles.submitButtonText}>Enroll Student</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
));


export default function StudentsScreen({ route, navigation }) {
    const { classId, className } = route.params;
    const { students, deleteStudent, loading, addStudent } = useContext(AppContext);
    
    // *** FIX APPLIED HERE ***
    // 1. Convert classId (which is likely a number) to a string key.
    // 2. Safely default the key to an empty string if classId is missing.
    const classIdKey = classId ? classId.toString() : '';
    
    // 3. Filter the global students cache for the current class, ensuring the result is always an array ([]).
    const classStudents = students[classIdKey] || [];

    const [isEnrollModalVisible, setEnrollModalVisible] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Local state for enrollment button

    const handleDropStudent = (studentId, studentName) => {
        Alert.alert(
            "Confirm Drop",
            `Are you sure you want to drop ${studentName}? This action cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Drop",
                    style: "destructive",
                    onPress: async () => {
                        const { success, message } = await deleteStudent(classId, studentId);
                        if (success) {
                            Alert.alert("Success", `${studentName} has been dropped from ${className}.`);
                        } else {
                            Alert.alert("Drop Failed", message || "An unknown error occurred while dropping the student.");
                        }
                    }
                }
            ]
        );
    };
    
    const handleEnrollStudent = async () => {
        if (!newStudentName.trim() || !newRegistrationNumber.trim()) {
             Alert.alert('Missing Details', 'Please enter both student name and registration number.');
             return;
        }

        setIsSubmitting(true);
        
        const { success, message } = await addStudent(
            classId, 
            newStudentName.trim(), 
            newRegistrationNumber.trim()
        );

        setIsSubmitting(false);

        if (success) {
            Alert.alert("Success", "Student enrolled successfully.");
            setNewStudentName('');
            setNewRegistrationNumber('');
            setEnrollModalVisible(false);
        } else {
            Alert.alert("Enrollment Failed", message || "An unknown error occurred.");
        }
    };

    const handleCloseModal = () => {
        setEnrollModalVisible(false);
        setNewStudentName('');
        setNewRegistrationNumber('');
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Content Area (Header and Scrollable List) - Takes up all available space */}
            <View style={styles.contentArea}>
                
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{className} Students</Text>
                    <Text style={styles.subtitle}>{classStudents.length} Students Enrolled</Text>
                </View>

                {/* Main Content */}
                {loading && classStudents.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading students...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={classStudents}
                        renderItem={({ item }) => (
                            <StudentCard
                                student={item}
                                onDrop={() => handleDropStudent(item.id, item.name)}
                            />
                        )}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={[styles.listContent, { paddingBottom: BOTTOM_BUTTON_HEIGHT }]} 
                        ListEmptyComponent={<Text style={styles.emptyText}>No students are currently enrolled in this class.</Text>}
                    />
                )}
            </View>
            
            {/* Enrollment Button - Fixed at the bottom of the safe area view */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={() => setEnrollModalVisible(true)}
                    disabled={loading}
                >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text style={styles.enrollButtonText}>Enroll New Student</Text>
                </TouchableOpacity>
            </View>

            
            {/* Modal for Enrollment - now uses the dedicated component */}
            <AddStudentModal 
                isVisible={isEnrollModalVisible}
                onClose={handleCloseModal}
                name={newStudentName}
                setName={setNewStudentName}
                registrationNumber={newRegistrationNumber}
                setRegistrationNumber={setNewRegistrationNumber}
                onSubmit={handleEnrollStudent}
                isSubmitting={isSubmitting}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC', // Light background
    },
    contentArea: {
        flex: 1,
        paddingHorizontal: 20, // Apply horizontal padding here
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#007AFF', // Primary color
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    listContent: {
        paddingVertical: 10, 
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#64748B',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748B',
    },
    bottomButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 70, 
        backgroundColor: '#F7F9FC', // Match safeArea background
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    enrollButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34C759', // Green for positive action
        padding: 15,
        borderRadius: 12,
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    enrollButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1A202C',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#F7FAFC',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: '#007AFF', // Primary Blue
    },
    cancelButton: {
        backgroundColor: '#E2E8F0', // Light Gray
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: '#1A202C',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
