import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

// Using the IP address from your recent code
const API_BASE_URL = 'http://192.168.1.36:3000/api';
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
    const [userId, setUserId] = useState(null);
    const [displayName, setDisplayName] = useState('Instructor');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState({});
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/data`, { headers: getAuthHeaders(token) });
            if (!response.ok) throw new Error('Failed to fetch data.');
            const data = await response.json();
            setClasses(data.classes || []);
            setStudents(data.students || {});
            setAttendance(data.attendance || {});
            setDisplayName(data.displayName || 'Instructor');
            setUserId(data.userId);
        } catch (error) {
            Alert.alert('Connection Error', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                const userPayload = decodeJwt(token);
                if (userPayload) {
                    setUser(userPayload);
                    await refreshData();
                }
            }
            setIsAuthReady(true);
        };
        checkAuth();
    }, [refreshData]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
            const userPayload = decodeJwt(data.token);
            setUser(userPayload);
            await refreshData();
        } catch (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        }
    };

    const register = async (name, email, password, displayName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, displayName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            Alert.alert('Success', 'Registration successful! Please log in.');
            return { success: true };
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
            return { success: false };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setClasses([]);
        setStudents({});
        setAttendance({});
    };

    const setInstructorName = async (newDisplayName) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ displayName: newDisplayName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Update failed.');
            await refreshData();
            return { success: true };
        } catch (error) {
            Alert.alert('Update Failed', error.message);
            return { success: false };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to change password.');
            return { success: true, message: data.message };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false, message: error.message };
        }
    };

    const addClass = async (className) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/classes`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name: className }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not add class.');
            await refreshData();
            return { success: true };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false };
        }
    };

    const addStudent = async (classId, name, registrationNumber) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name, registrationNumber }),
            });
            if (!response.ok) throw new Error('Failed to enroll student.');
            await refreshData();
            return { success: true };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false };
        }
    };

    const deleteStudent = async (classId, studentId) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
            });
            if (!response.ok) throw new Error('Failed to drop student.');
            await refreshData();
            return { success: true };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false };
        }
    };

    const takeAttendance = async (classId, date, records) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/attendance`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ date, records }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            await refreshData();
            return { success: true };
        } catch (error) {
            Alert.alert('Error', error.message);
            return { success: false };
        }
    };

    return (
        <AppContext.Provider
            value={{
                user,
                userId,
                isAuthReady,
                loading,
                classes,
                students,
                attendance,
                displayName,
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

