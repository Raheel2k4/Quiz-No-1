import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const AppContext = createContext();

// 🚨 IMPORTANT: REPLACE 'YOUR_LOCAL_IP_ADDRESS' with your computer's actual network IP (e.g., 192.168.1.100).
// Your phone cannot reach 'localhost'.
const API_BASE_URL = 'http://YOUR_LOCAL_IP_ADDRESS:3000/api'; 

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState({});
  const [attendance, setAttendance] = useState({});
  const [currentAttendance, setCurrentAttendance] = useState({});

  // Helper function for API calls
  const apiFetch = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${user.token}` }), // Include token if logged in
        },
        ...options,
      });

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        setUser(null);
        return null;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert('Server Error', data.message || `API call to ${endpoint} failed.`);
        return null;
      }
      return data;
    } catch (error) {
      console.error(`Network or Parsing Error on ${endpoint}:`, error);
      Alert.alert('Connection Error', 'Could not connect to the local server. Is your backend running?');
      return null;
    }
  };

  // --- Data Fetching ---

  const fetchData = async (token) => {
    // Only fetch data if we have a user/token
    if (!token) return;

    const data = await apiFetch('/data', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (data) {
      setClasses(data.classes || []);
      setStudents(data.students || {});
      setAttendance(data.attendance || {});
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(user.token);
    } else {
      // Clear data on logout
      setClasses([]);
      setStudents({});
      setAttendance({});
    }
  }, [user]);


  // --- Auth Actions ---

  const login = async (email, password) => {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data && data.token) {
      setUser({ id: data.userId, email, token: data.token });
      return true;
    }
    return false;
  };

  const register = async (email, password) => {
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data && data.token) {
      // Auto-login after successful registration
      setUser({ id: data.userId, email, token: data.token });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };


  // --- Class/Student Actions ---

  const addClass = async (name) => {
    const data = await apiFetch('/classes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    if (data) {
      // Append the newly created class from the server response
      setClasses(prev => [...prev, data.newClass]);
      setStudents(prev => ({ ...prev, [data.newClass.id]: [] }));
      setAttendance(prev => ({ ...prev, [data.newClass.id]: [] }));
      return true;
    }
    return false;
  };

  const addStudent = async (classId, name, email) => {
    const data = await apiFetch(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });

    if (data) {
      // Update the students state for the specific class
      setStudents(prev => ({
        ...prev,
        [classId]: [...(prev[classId] || []), data.newStudent]
      }));
      // The server is responsible for updating the class student count, so we refetch classes
      fetchData(user.token);
      return true;
    }
    return false;
  };

  const deleteStudent = async (classId, studentId) => {
    const data = await apiFetch(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });

    if (data) {
      // Filter out the deleted student
      setStudents(prev => ({
        ...prev,
        [classId]: prev[classId].filter(s => s.id !== studentId)
      }));
      // Refetch data to update the class student count/rate
      fetchData(user.token); 
      return true;
    }
    return false;
  };

  const takeAttendance = async (classId, date) => {
    // Current attendance records stored in state: { studentId: boolean (present) }
    const records = Object.entries(currentAttendance).map(([studentId, present]) => ({
      date,
      studentId, // Keep as string for API consistency
      present,
    }));
    
    const data = await apiFetch(`/attendance/${classId}`, {
      method: 'POST',
      body: JSON.stringify({ records }),
    });

    if (data) {
      // Update both attendance history and class stats (rate, sessions)
      setAttendance(data.attendance || {});
      setClasses(data.classes || []);
      setCurrentAttendance({});
      return true;
    }
    return false;
  };


  return (
    <AppContext.Provider
      value={{
        user,
        classes,
        students,
        attendance,
        currentAttendance,
        setCurrentAttendance,
        login,
        register,
        logout,
        addClass,
        addStudent,
        deleteStudent,
        takeAttendance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
