import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

// NOTE: Please ensure this IP address is correct for your local network.
// You previously mentioned it was 192.168.186.1, I am using the one from the last version.
const API_BASE_URL = 'http://10.0.7.179:3000/api';
const AUTH_TOKEN_KEY = 'userAuthToken';

const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState({});
    const [attendance, setAttendance] = useState({});
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    // This function now handles the initial token validation and data load.
    useEffect(() => {
        const validateTokenAndLoadData = async () => {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                setIsAuthReady(true);
                return; // No token, proceed to login screen.
            }

            // Found a token, now validate it by fetching data.
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/data`, { headers: getAuthHeaders(token) });
                if (!response.ok) {
                    throw new Error('Session expired. Please log in again.');
                }
                const data = await response.json();
                
                // If data fetch succeeds, the token is valid. Set user and all data.
                setUser(decodeJwt(token));
                setClasses(data.classes || []);
                setStudents(data.students || {});
                setAttendance(data.attendance || {});
                setDisplayName(data.displayName || '');

            } catch (error) {
                console.error("Auth validation failed:", error.message);
                // If validation fails, clear the bad token.
                await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
                setUser(null);
            } finally {
                // Mark auth as ready so the navigator can show the correct screen.
                setLoading(false);
                setIsAuthReady(true);
            }
        };

        validateTokenAndLoadData();
    }, []);

    // A simplified refresh function for use after login or other actions.
    const refreshData = useCallback(async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/data`, { headers: getAuthHeaders(token) });
            const data = await response.json();
            if (!response.ok) throw new Error('Failed to sync data.');
            
            setClasses(data.classes || []);
            setStudents(data.students || {});
            setAttendance(data.attendance || {});
            setDisplayName(data.displayName || '');
        } catch (error) {
            Alert.alert('Sync Error', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed.');
            
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
            setUser(decodeJwt(data.token)); // Set user to trigger navigation
            await refreshData(); // Load data for the new session
            return { success: true };
        } catch (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false); // Ensure loading stops on failure
            return { success: false };
        }
    };
    
    const register = async (name, email, password, displayName) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, displayName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed.');
            Alert.alert('Success', 'Registration successful. Please log in.');
            return { success: true };
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setClasses([]);
        setStudents({});
        setAttendance({});
        setDisplayName('');
    };
    
    const performApiAction = async (endpoint, options = {}, errorMessage) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: getAuthHeaders(token),
                ...options,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || errorMessage);
            
            await refreshData();
            return { success: true, data };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false };
        }
    };

    const addClass = (className) => performApiAction('/classes', {
        method: 'POST',
        body: JSON.stringify({ name: className }),
    }, 'Could not add class.');

    const addStudent = (classId, name, registrationNumber) => performApiAction(`/classes/${classId}/students`, {
        method: 'POST',
        body: JSON.stringify({ name, registrationNumber }),
    }, 'Failed to enroll student.');

    const deleteStudent = (classId, studentId) => performApiAction(`/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
    }, 'Failed to drop student.');

    const takeAttendance = (classId, date, records) => performApiAction(`/classes/${classId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ date, records }),
    }, 'Failed to submit attendance.');

    const setInstructorName = (newDisplayName) => performApiAction('/profile', {
        method: 'POST',
        body: JSON.stringify({ displayName: newDisplayName }),
    }, 'Failed to update profile name.');

    const changePassword = (currentPassword, newPassword) => performApiAction('/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
    }, 'Failed to change password.');


    return (
        <AppContext.Provider
            value={{
                user,
                isAuthReady,
                classes,
                students,
                attendance,
                displayName,
                loading,
                login,
                register,
                logout,
                setInstructorName,
                changePassword,
                addClass,
                addStudent,
                deleteStudent,
                takeAttendance,
                refreshData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

