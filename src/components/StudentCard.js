import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentCard({ student, onDrop }) {
    // Note: The logic in StudentsScreen ensures registrationNumber is available 
    // for students enrolled before the email->RegNo change by using email as fallback.
    const regDisplay = student.registrationNumber || 'N/A';
    
    return (
        <View style={styles.card}>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{student.name}</Text>
                <Text style={styles.regNo}>Reg No: {regDisplay}</Text>
            </View>
            <TouchableOpacity 
                style={styles.dropButton}
                onPress={onDrop}
            >
                {/* Basket icon for Drop Student functionality */}
                <Ionicons name="trash-outline" size={20} color="#E53E3E" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#4C51BF',
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A202C',
    },
    regNo: {
        fontSize: 14,
        color: '#718096',
        marginTop: 4,
    },
    dropButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FED7D7', // Light red background for emphasis
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});