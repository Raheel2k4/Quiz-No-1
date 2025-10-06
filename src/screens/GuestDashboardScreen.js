import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function GuestDashboardScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Header title="Guest View" navigation={navigation} />
            <View style={styles.container}>
                <Ionicons name="person-circle-outline" size={80} color="#007AFF" style={styles.icon} />
                <Text style={styles.title}>Welcome to Student Tracker!</Text>
                <Text style={styles.subtitle}>Log in or sign up to manage your classes and students.</Text>
                <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>Don't have an account? <Text style={styles.registerLinkBold}>Register here</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 30,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerLink: {
        fontSize: 14,
        color: '#64748B',
    },
    registerLinkBold: {
        fontWeight: 'bold',
        color: '#007AFF',
    }
});