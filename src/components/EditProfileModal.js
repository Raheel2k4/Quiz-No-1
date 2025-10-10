import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const EditProfileModal = ({ isVisible, onClose, currentName, onSave }) => {
    const [newName, setNewName] = useState(currentName);
    const [isSaving, setIsSaving] = useState(false);

    // This effect ensures that if the modal is re-opened, it always shows the latest name from the parent state.
    React.useEffect(() => {
        if (isVisible) {
            setNewName(currentName);
        }
    }, [isVisible, currentName]);

    const handleSave = async () => {
        if (!newName.trim() || newName.trim() === currentName) {
            onClose();
            return;
        }
        setIsSaving(true);
        const success = await onSave(newName.trim());
        setIsSaving(false);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit Display Name</Text>
                    <TextInput
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                        autoCapitalize="words"
                        autoFocus={true}
                        placeholder="Enter your display name"
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isSaving}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A202C',
    },
    input: {
        height: 50,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#F7FAFC',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#E2E8F0',
    },
    saveButton: {
        backgroundColor: '#4C51BF',
    },
    cancelButtonText: {
        color: '#2D3748',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default EditProfileModal;
