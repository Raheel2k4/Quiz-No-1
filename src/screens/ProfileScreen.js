import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import EditProfileModal from '../components/EditProfileModal'; // Assuming you have this component for name editing

// New, self-contained Modal for Help & Support
const HelpModal = ({ isVisible, onClose }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Ionicons name="help-circle-outline" size={50} color="#4C51BF" style={{ marginBottom: 10 }} />
                    <Text style={modalStyles.modalTitle}>Help & Support</Text>
                    <Text style={modalStyles.helpText}>For any assistance, feedback, or issues with the app, please do not hesitate to contact our support team.</Text>
                    
                    <TouchableOpacity style={modalStyles.contactButton} onPress={() => Linking.openURL('mailto:support@attendanceapp.com?subject=App Support Request')}>
                        <Ionicons name="mail-outline" size={20} color="white" />
                        <Text style={modalStyles.contactButtonText}>Email Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[modalStyles.button, modalStyles.closeButton]} onPress={onClose}>
                        <Text style={modalStyles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


export default function ProfileScreen({ navigation }) {
    const { user, logout, displayName, setInstructorName, refreshData } = useContext(AppContext);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isHelpModalVisible, setHelpModalVisible] = useState(false);

    const handleLogout = () => { logout(); };

    const handleUpdateName = async (newName) => {
        const { success } = await setInstructorName(newName);
        if (success) {
            await refreshData();
            Alert.alert("Success", "Your display name has been updated.");
            return true;
        }
        return false;
    };

    const profileName = displayName || 'Instructor';
    const userEmail = user?.email || 'instructor@example.com';

    // Updated settings to navigate correctly and open the new modal
    const settingsItems = [
        { name: "Change Password", icon: "lock-closed-outline", action: () => navigation.navigate('ChangePassword') },
        { name: "Help & Support", icon: "help-circle-outline", action: () => setHelpModalVisible(true) },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profileCard}>
                    <Ionicons name="person-circle-outline" size={80} color="#4C51BF" />
                    <Text style={styles.profileName}>{profileName}</Text>
                    <Text style={styles.profileEmail}>{userEmail}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                        <Ionicons name="create-outline" size={16} color="#4C51BF" />
                        <Text style={styles.editButtonText}>Edit Name</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.settingsSection}>
                    {settingsItems.map((item) => (
                        <TouchableOpacity key={item.name} style={styles.settingItem} onPress={item.action}>
                            <Ionicons name={item.icon} size={22} color="#4C51BF" style={styles.settingIcon} />
                            <Text style={styles.settingText}>{item.name}</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#CBD5E0" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <EditProfileModal
                isVisible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                currentName={displayName}
                onSave={handleUpdateName}
            />
            <HelpModal 
                isVisible={isHelpModalVisible} 
                onClose={() => setHelpModalVisible(false)} 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
    container: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 60 },
    profileCard: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    profileIcon: { marginBottom: 10 },
    profileName: { fontSize: 24, fontWeight: '700', color: '#2D3748', marginBottom: 5 },
    profileEmail: { fontSize: 16, color: '#718096', marginBottom: 20 },
    editButton: {
        flexDirection: 'row',
        backgroundColor: '#EBF4FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
    },
    editButtonText: { color: '#4C51BF', fontWeight: '600', fontSize: 14, marginLeft: 5 },
    settingsSection: {
        marginBottom: 30,
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settingIcon: { marginRight: 15 },
    settingText: { flex: 1, fontSize: 16, color: '#4A5568' },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#E53E3E',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    logoutButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
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
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 15,
        textAlign: 'center',
    },
    helpText: {
        fontSize: 16,
        color: '#4A5568',
        textAlign: 'center',
        marginBottom: 25,
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: '#4C51BF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 10,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    closeButton: {
        backgroundColor: '#E2E8F0',
    },
    closeButtonText: {
        color: '#2D3748',
        fontWeight: 'bold',
    },
    button: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
});

