import React, { useContext, useState, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import StudentCard from '../components/StudentCard';

// Increased Height estimate for the button plus its container padding.
// The previous value was 135. Adding another 50 for extra clearance/padding makes it 185.
const BOTTOM_BUTTON_HEIGHT = 185; // 135 (previous) + 50 (extra padding requested) = 185

// --- Dedicated Modal Component for Enrollment (FIX APPLIED HERE) ---
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
                {/* Inputs now use the stable state setters passed via props */}
                <TextInput
                    style={modalStyles.input}
                    placeholder="Student Name (e.g., Alice Johnson)"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    // Added autoFocus to help open directly into the first field
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
                        // Added input validation to disable button if fields are empty
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
    // We now rely on the global 'loading' state for general data fetching
    const { students, deleteStudent, loading, addStudent } = useContext(AppContext);
    
    // Filter the global students cache for the current class
    const classStudents = students[classId] || [];

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
                        // Global loading state is set inside AppContext's deleteStudent function
                        const { success, message } = await deleteStudent(classId, studentId);
                        if (success) {
                            Alert.alert("Success", `${studentName} has been dropped from ${className}.`);
                        } else {
                            // The deleteStudent function in AppContext handles its own Alert, 
                            // but we ensure a message is available if it fails silently.
                            Alert.alert("Drop Failed", message || "An unknown error occurred while dropping the student.");
                        }
                    }
                }
            ]
        );
    };
    
    /**
     * FIX: Ensures the modal is closed and local state is reset immediately upon success.
     */
    const handleEnrollStudent = async () => {
        // Validation check is now handled in the submit button's disabled state in the modal component
        if (!newStudentName.trim() || !newRegistrationNumber.trim()) {
             Alert.alert('Missing Details', 'Please enter both student name and registration number.');
             return;
        }

        setIsSubmitting(true); // Start local loading for the button
        
        // Corrected call to addStudent to match the AppContext signature: (classId, name, registrationNumber)
        const { success, message } = await addStudent(
            classId, 
            newStudentName.trim(), 
            newRegistrationNumber.trim()
        );

        // The global loading state is reset inside AppContext.js's addStudent function (in finally block).
        setIsSubmitting(false); // Stop local loading for the button

        if (success) {
            // Success: Close modal and reset inputs immediately
            Alert.alert("Success", "Student enrolled successfully.");
            // Reset state and hide modal
            setNewStudentName('');
            setNewRegistrationNumber('');
            setEnrollModalVisible(false);
        } else {
            // Failure: Show error and keep modal open for correction
            Alert.alert("Enrollment Failed", message || "An unknown error occurred.");
        }
    };

    const handleCloseModal = () => {
        setEnrollModalVisible(false);
        // Clear inputs on close for a clean start next time
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
                    <Text style={styles.subtitle}>{classStudents.length} Students Enrolled}</Text>
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
                        // Added padding to the bottom of the list so the last item is not hidden behind the fixed button
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
    // New container for Header and FlatList to take up remaining space
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
        // Base padding for list items - extra bottom padding added inline in the component
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
    // New container to hold the button and ensure consistent bottom spacing
    bottomButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        // *** CHANGE HERE: Increased paddingBottom by 50 (20 -> 70) to push the button up ***
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
