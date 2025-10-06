import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const AppContext = createContext();

// --- API Configuration ---
// IMPORTANT: Ensure this URL matches where your server.js is running
const API_BASE_URL = 'http://192.168.1.37:3000/api'; 
const AUTH_TOKEN_KEY = 'userAuthToken';

// --- Helper Functions ---

/**
 * Creates a standard header for API requests, including the JWT token.
 * @param {string} token - The user's JWT.
 * @returns {object} Headers object.
 */
const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

/**
 * Fetches all necessary initial state for the user after a successful login.
 * This is the central function for keeping the app state synchronized with the server.
 */
const loadInitialData = async (authToken, setState) => {
    setState({ loading: true });
    try {
        const response = await fetch(`${API_BASE_URL}/data`, {
            method: 'GET',
            headers: getAuthHeaders(authToken),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch initial data.");
        }

        const data = await response.json();
        
        // Update the context state using the received data
        setState({
            classes: data.classes || [],
            students: data.students || {},
            attendance: data.attendance || {},
            loading: false,
        });
        return true;

    } catch (error) {
        console.error("Error loading initial data:", error);
        setState({ loading: false });
        return false;
    }
};

export const AppContextProvider = ({ children }) => {
    // --- State Variables ---
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(null); // JWT for API calls
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState({}); 
    const [attendance, setAttendance] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false); 

    // Computed display name (using the name provided by the server upon login)
    const userId = user?.id || null;
    const displayName = user?.displayName || user?.name || 'Guest';

    // Helper to update multiple state pieces
    const updateState = (updates) => {
        if (updates.classes !== undefined) setClasses(updates.classes);
        if (updates.students !== undefined) setStudents(updates.students);
        if (updates.attendance !== undefined) setAttendance(updates.attendance);
        if (updates.loading !== undefined) setLoading(updates.loading);
    };

    // --- Authentication and Token Handling ---

    const saveTokenAndUser = async (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        // Only saving token, user data will be re-fetched or retrieved from context
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
    };

    const removeToken = async () => {
        setToken(null);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    };

    // Load token and initial data on app start
    useEffect(() => {
        const checkTokenAndLoad = async () => {
            const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (storedToken) {
                setToken(storedToken);
                // Attempt to load data, which implicitly verifies the token and retrieves user data
                const success = await loadInitialData(storedToken, updateState); 
                if (!success) {
                    await removeToken(); 
                    setUser(null);
                }
                // NOTE: We rely on the /api/data response to establish initial user details.
            } 
            // Mark auth ready whether a token was found or not
            setIsAuthReady(true);
        };
        checkTokenAndLoad();
    }, []); 

    // POST /api/register
    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Registration Failed', data.message || 'An error occurred during registration.');
                return false;
            }

            // Success: set user and save token, then load fresh data
            await saveTokenAndUser(data.token, data.user);
            await loadInitialData(data.token, updateState);
            return true;
        } catch (error) {
            console.error("Register error:", error);
            Alert.alert('Network Error', 'Could not connect to the registration server.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // POST /api/login
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Login Failed', data.message || 'Invalid email or password.');
                return false;
            }

            // Success: set user, save token, and fetch initial data
            await saveTokenAndUser(data.token, data.user);
            await loadInitialData(data.token, updateState);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert('Network Error', 'Could not connect to the login server.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true);
        setUser(null);
        setClasses([]);
        setStudents({});
        setAttendance({});
        await removeToken();
        setLoading(false);
    }, []);
    
    // Placeholder for setting instructor name (requires a server PUT endpoint not defined yet)
    const setInstructorName = (name) => {
        // For now, we only update the local state.
        if (user) {
            setUser(prev => ({ ...prev, name, displayName: name }));
        }
        // To be fully persisted, this would need an API call: 
        // fetch(`${API_BASE_URL}/profile`, { method: 'PUT', ... })
    };

    // POST /api/classes
    const addClass = async (className) => {
        if (!token) return Alert.alert('Error', 'Not authenticated.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/classes`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name: className }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', data.message || 'Failed to add class.');
                return false;
            }

            // The server returns the updated list of classes
            setClasses(data.classes); 
            Alert.alert('Success', `${className} created successfully.`);
            return true;
        } catch (error) {
            console.error("Add Class error:", error);
            Alert.alert('Network Error', 'Failed to connect to server.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // POST /api/classes/:classId/students
    const addStudent = async (classId, name, registrationNumber) => {
        if (!token) return { success: false, message: 'Not authenticated.' };
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name, registrationNumber }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Failed to enroll student.' };
            }

            // Server returns updated students for the class and updated classes list
            setStudents(prev => ({ ...prev, [classId]: data.students }));
            setClasses(data.classes); // Class count/rate may have updated
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Add Student error:", error);
            return { success: false, message: 'Failed to connect to server.' };
        } finally {
            setLoading(false);
        }
    };

    // DELETE /api/classes/:classId/students/:studentId
    const deleteStudent = async (classId, studentId) => {
        if (!token) return { success: false, message: 'Not authenticated.' };
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
            });
            
            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Failed to drop student.' };
            }

            // Server returns updated students, classes (rate updated), and attendance (cleaned up)
            setStudents(prev => ({ ...prev, [classId]: data.students }));
            setClasses(data.classes);
            setAttendance(data.attendance); 

            return { success: true, message: data.message };
        } catch (error) {
            console.error("Delete Student error:", error);
            return { success: false, message: 'Failed to connect to server.' };
        } finally {
            setLoading(false);
        }
    };

    // POST /api/classes/:classId/attendance
    const takeAttendance = async (classId, date, records) => {
        if (!token) return { success: false, message: 'Not authenticated.' };
        setLoading(true);
        try {
            // Records structure: [{ studentId: number, present: boolean }]
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/attendance`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ date, records }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Failed to submit attendance.' };
            }

            // Server returns the updated classes (rate updated) and full attendance history
            setClasses(data.classes);
            setAttendance(data.attendance);

            Alert.alert("Success", "Attendance submitted and reports updated.");
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Take Attendance error:", error);
            return { success: false, message: 'Failed to connect to server.' };
        } finally {
            setLoading(false);
        }
    };

    // Utility function to get students for a class from the local cache
    const getStudentsForClass = (id) => students[id] || [];


    return (
        <AppContext.Provider
            value={{
                // Auth/Profile state
                user,
                userId,
                displayName,
                isAuthReady,
                setInstructorName,
                login,
                register, 
                logout,

                // Data state
                classes,
                students, 
                attendance,
                loading, 

                // Data functions
                addClass,
                getStudentsForClass,
                addStudent,
                deleteStudent,
                takeAttendance,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
