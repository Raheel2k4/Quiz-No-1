import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const AppContext = createContext();

// --- API Configuration ---
// IMPORTANT: Ensure this URL matches where your server.js is running
// Using the last reported IP address for better connectivity.
const API_BASE_URL = 'http://10.0.6.120:3000/api'; 
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
 * Decodes a JWT token to extract the payload (user info).
 * NOTE: This is a client-side decode and should not be used for security validation.
 */
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


/**
 * Fetches all necessary initial state for the user after a successful login.
 * @param {string} authToken - JWT token for authorization.
 * @param {object} setters - An object containing all necessary setState functions.
 */
// FIX: Renamed 'setState' parameter to 'setters' to avoid function vs. object confusion.
const loadInitialData = async (authToken, setters) => { 
    setters.loading(true); // Now correctly calling the 'loading' setter from the 'setters' object
    try {
        const response = await fetch(`${API_BASE_URL}/data`, {
            method: 'GET',
            headers: getAuthHeaders(authToken),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch initial data. Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update all states using the destructured setters
        setters.setClasses(data.classes || []); 
        setters.setStudents(data.students || {}); 
        setters.setAttendance(data.attendance || {}); 
        setters.setDisplayName(data.displayName || 'Instructor');
        setters.setUserId(data.userId);

        return { success: true };

    } catch (error) {
        console.error("Load Initial Data error:", error);
        Alert.alert("Connection Error", `Failed to load data: ${error.message}. Please check your server status and API_BASE_URL.`);
        return { success: false, message: error.message };
    } finally {
        // Ensure loading state is turned off regardless of success or failure
        setters.loading(false); 
        setters.isAuthReady(true);
    }
};


export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [displayName, setDisplayName] = useState('Instructor');
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    // --- State Initialization Fixes (for the previous map error) ---
    const [classes, setClasses] = useState([]); 
    const [students, setStudents] = useState({}); 
    const [attendance, setAttendance] = useState({}); 
    
    const [loading, setLoading] = useState(false);

    // --- Authentication and Setup ---

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                const userPayload = decodeJwt(token);
                if (userPayload) {
                    setUser(userPayload);
                    setUserId(userPayload.userId);
                    // Pass the setters directly
                    await loadInitialData(token, { setClasses, setStudents, setAttendance, setDisplayName, setUserId, loading: setLoading, isAuthReady: setIsAuthReady });
                    return;
                }
            }
            // If no valid token, just mark auth ready
            setIsAuthReady(true);
        };
        checkAuth();
    }, []);


    // --- Auth Functions ---
    const login = async (email, password) => {
        setLoading(true);
        try {
            console.log(`Attempting login to ${API_BASE_URL}/login`);
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Check status before attempting to parse
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse response error.' }));
                console.error(`Login API failed. Status: ${response.status}, Message: ${errorData.message}`);
                Alert.alert('Login Failed', errorData.message || `Server returned status ${response.status}.`);
                return { success: false };
            }

            const data = await response.json();

            // Store token and set user data
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
            const userPayload = decodeJwt(data.token);
            
            setUser(userPayload);
            setUserId(userPayload.userId);
            setDisplayName(data.displayName);
            
            // Load all remaining data
            await loadInitialData(data.token, { setClasses, setStudents, setAttendance, setDisplayName, setUserId, loading: setLoading, isAuthReady: setIsAuthReady });

            return { success: true };
        } catch (error) {
            console.error("Login error (Network/Parse):", error.message);
            Alert.alert('Connection Error', `Could not connect to the server at ${API_BASE_URL}. Ensure server.js is running and the IP is correct.`);
            return { success: false };
        } finally {
            // Note: setLoading(false) is handled by loadInitialData's finally block if successful.
            // If login failed before loadInitialData was called, this handles the reset.
            if (!user) {
                setLoading(false);
            }
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

            if (!response.ok) {
                Alert.alert('Registration Failed', data.message || 'Error creating account.');
                return { success: false, message: data.message };
            }

            return { success: true, message: data.message };
        } catch (error) {
            console.error("Registration error:", error);
            Alert.alert('Connection Error', 'Could not connect to the server.');
            return { success: false, message: 'Connection Error' };
        } finally {
            setLoading(false);
        }
    };


    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setUserId(null);
        setDisplayName('Instructor');
        setClasses([]);
        setStudents({});
        setAttendance({});
        setIsAuthReady(true);
    };

    const setInstructorName = async (newDisplayName) => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            Alert.alert('Error', 'Not authenticated.');
            return { success: false };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ displayName: newDisplayName }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Update Failed', data.message || 'Could not update profile.');
                return { success: false };
            }

            setDisplayName(data.displayName);
            Alert.alert("Success", "Display name updated successfully.");
            return { success: true };
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert('Connection Error', 'Failed to connect to server.');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // --- Data Management Functions ---

    const addClass = async (className) => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return { success: false, message: 'Not authenticated.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/classes`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name: className }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                Alert.alert('Class Creation Failed', data.message || 'Error creating class.');
                return { success: false, message: data.message };
            }

            // Server returns the full, updated list of classes
            setClasses(data.classes);
            
            // Initialize the new class in the local student cache (empty array)
            setStudents(prevStudents => ({
                ...prevStudents,
                [data.newClass.id.toString()]: []
            }));

            Alert.alert("Success", `${className} created successfully!`);
            return { success: true, message: data.message };

        } catch (error) {
            console.error("Add Class error:", error);
            return { success: false, message: 'Failed to connect to server.' };
        } finally {
            setLoading(false);
        }
    };
    
    const addStudent = async (classId, name, registrationNumber) => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return { success: false, message: 'Not authenticated.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ name, registrationNumber }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                Alert.alert('Enrollment Failed', data.message || 'Error enrolling student.');
                return { success: false, message: data.message };
            }
            
            // Server returns updated students cache and updated classes (for student count/rate)
            setStudents(data.students);
            setClasses(data.classes); 
            
            return { success: true, message: data.message };

        } catch (error) {
            console.error("Add Student error:", error);
            return { success: false, message: 'Failed to connect to server.' };
        } finally {
            setLoading(false);
        }
    };


    const deleteStudent = async (classId, studentId) => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return { success: false, message: 'Not authenticated.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Drop Failed', data.message || 'Error dropping student.');
                return { success: false, message: data.message };
            }
            
            // Server returns updated students, classes, and attendance after deletion
            setStudents(data.students);
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

    const takeAttendance = async (classId, date, records) => {
        setLoading(true);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return { success: false, message: 'Not authenticated.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}/attendance`, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ date, records }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                Alert.alert('Attendance Failed', data.message || 'Error recording attendance.');
                return { success: false, message: data.message };
            }

            // Server returns the updated classes (rate updated) and full attendance history
            setClasses(data.classes);
            setAttendance(data.attendance);

            Alert.alert("Success", data.message || "Attendance submitted and reports updated.");
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
                students, // Student cache structure: { classId: [student objects] }
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
