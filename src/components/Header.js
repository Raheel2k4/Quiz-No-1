import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

// The Header component now accepts a 'showProfileButton' prop to control the icon's visibility
export default function Header({ title, navigation, showProfileButton = true }) {
    const { user } = useContext(AppContext);
    const insets = useSafeAreaInsets();

    const rightButtonContent = () => {
        if (user) {
            return (
                <TouchableOpacity 
                    style={styles.rightButton} 
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle-outline" size={30} color="white" />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity 
                    style={styles.rightButton} 
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.rightButtonText}>Login / Sign Up</Text>
                </TouchableOpacity>
            );
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.title}>{title}</Text>
            {/* The profile button content is now only rendered if showProfileButton is true */}
            <View style={styles.rightButtonContainer}>
                {showProfileButton && rightButtonContent()}
            </View>
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
        backgroundColor: '#4C51BF',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
    },
    rightButtonContainer: {
        minWidth: 40, // Ensures layout consistency even when button is hidden
        alignItems: 'flex-end',
    },
    rightButton: {
        padding: 5,
    },
    rightButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

