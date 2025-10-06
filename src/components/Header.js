import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
// Importing Ionicons for a cleaner profile button when logged in
import { Ionicons } from '@expo/vector-icons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

export default function Header({ title, navigation }) {
    const { user } = useContext(AppContext);
    const insets = useSafeAreaInsets();

    const rightButtonContent = () => {
        if (user) {
            return (
                <TouchableOpacity 
                    style={styles.rightButton} 
                    onPress={() => navigation.navigate('Profile')}
                >
                    {/* Use an icon for a modern, clean look when authenticated */}
                    <Ionicons name="person-circle-outline" size={30} color="white" />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity 
                    style={styles.rightButton} 
                    onPress={() => navigation.navigate('Login')}
                >
                    {/* Keep text for the action when not logged in */}
                    <Text style={styles.rightButtonText}>Login / Sign Up</Text>
                </TouchableOpacity>
            );
        }
    };

    return (
        // Add paddingTop based on safe area insets for notched devices
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.title}>{title}</Text>
            {rightButtonContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        
        // --- UPDATED COLORS AND STRUCTURE ---
        backgroundColor: '#4C51BF', // Primary Purple Brand Color
        borderBottomLeftRadius: 10, // Subtle curve
        borderBottomRightRadius: 10, // Subtle curve
        // --- END UPDATED STYLES ---

        elevation: 6, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: '700', // Slightly bolder
        color: 'white',
    },
    rightButton: {
        padding: 5, // Reduced padding for better icon placement
    },
    rightButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
