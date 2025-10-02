const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_jwt_secret'; // Use a strong, secret key in a real app

// --- LowDB Setup ---
// Use the relative path 'db.json' since server.js is running from the backend directory
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize DB structure if it doesn't exist
db.defaults({ users: [], classes: [], students: {}, attendance: {} }).write();

// --- Middleware ---
app.use(bodyParser.json());

// --- Simple Greeting Routes for Browser Check ---
// New root route (/)
app.get('/', (req, res) => {
    res.send('Welcome to the Student Attendance Tracker API! Use the /api/ endpoint for services.');
});

// New API root route (/api)
app.get('/api', (req, res) => {
    res.json({ message: 'API is running successfully.' });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- Helper Functions ---

const calculateAttendanceRate = (classId, studentsData, attendanceData) => {
    const classAttendance = attendanceData[classId] || [];
    const classStudents = studentsData[classId] || [];

    if (classStudents.length === 0 || classAttendance.length === 0) {
        return { totalSessions: 0, attendanceRate: 0, studentCount: classStudents.length };
    }

    const totalStudentRecords = classAttendance.length;
    const totalPresentRecords = classAttendance.filter(r => r.present).length;
    
    // We can calculate the total unique sessions by dividing the total records by the number of students.
    // This is an estimate assuming all students are present in all sessions.
    const uniqueStudentIds = [...new Set(classStudents.map(s => s.id))];
    const totalSessions = Math.round(totalStudentRecords / uniqueStudentIds.length);
    
    // Calculate overall class attendance rate
    const attendanceRate = Math.round((totalPresentRecords / totalStudentRecords) * 100);

    return { 
        totalSessions, 
        attendanceRate: isNaN(attendanceRate) ? 0 : attendanceRate, 
        studentCount: classStudents.length 
    };
};

const updateClassStats = (classId) => {
    const classes = db.get('classes').value();
    const students = db.get('students').value();
    const attendance = db.get('attendance').value();

    const { studentCount, attendanceRate } = calculateAttendanceRate(classId, students, attendance);

    // Update the specific class entry in the DB
    db.get('classes')
      .find({ id: classId })
      .assign({ 
          students: studentCount, 
          attendanceRate: attendanceRate 
      })
      .write();
};


// --- API Routes ---

// 1. Register
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    
    if (db.get('users').find({ email }).value()) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const userId = Date.now().toString(); // Simple ID generation
    const newUser = { id: userId, email, password }; 
    db.get('users').push(newUser).write();

    const token = jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Registration successful', userId, token });
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.get('users').find({ email, password }).value();

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', userId: user.id, token });
});

// 3. Get All Data (Dashboard Initial Fetch) - Protected Route
app.get('/api/data', authenticateToken, (req, res) => {
    const classes = db.get('classes').filter({ userId: req.user.userId }).value();
    const students = db.get('students').value();
    const attendance = db.get('attendance').value();

    // Recalculate and update stats before sending
    classes.forEach(cls => {
        updateClassStats(cls.id); 
    });
    const updatedClasses = db.get('classes').filter({ userId: req.user.userId }).value();


    // Filter students and attendance to only return relevant data for the user's classes
    const userClassIds = updatedClasses.map(c => c.id);

    const userStudents = {};
    Object.keys(students).forEach(classId => {
        if (userClassIds.includes(parseInt(classId))) {
            userStudents[classId] = students[classId];
        }
    });

    const userAttendance = {};
    Object.keys(attendance).forEach(classId => {
        if (userClassIds.includes(parseInt(classId))) {
            userAttendance[classId] = attendance[classId];
        }
    });

    res.json({ 
        classes: updatedClasses, 
        students: userStudents, 
        attendance: userAttendance 
    });
});

// 4. Add Class - Protected Route
app.post('/api/classes', authenticateToken, (req, res) => {
    const { name } = req.body;
    const newClass = { 
        id: Date.now(), 
        userId: req.user.userId, // Associate class with the user
        name, 
        students: 0, 
        attendanceRate: 0 
    };

    db.get('classes').push(newClass).write();
    // Initialize student and attendance lists for the new class
    db.get('students').value()[newClass.id] = [];
    db.get('attendance').value()[newClass.id] = [];
    db.write(); // Commit student/attendance initialization

    res.json({ message: 'Class added', newClass });
});

// 5. Add Student - Protected Route
app.post('/api/classes/:classId/students', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const { name, email } = req.body;
    
    // Check if class belongs to user
    const cls = db.get('classes').find({ id: classId, userId: req.user.userId }).value();
    if (!cls) return res.status(404).json({ message: 'Class not found or unauthorized' });

    const newStudent = { 
        id: Date.now(), 
        name, 
        email 
    };
    
    // Add student to the students map
    db.get('students').value()[classId].push(newStudent);
    db.write();

    // Update class stats (student count)
    updateClassStats(classId); 

    res.json({ message: 'Student added', newStudent });
});

// 6. Delete Student - Protected Route
app.delete('/api/classes/:classId/students/:studentId', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);

    // Check if class belongs to user
    const cls = db.get('classes').find({ id: classId, userId: req.user.userId }).value();
    if (!cls) return res.status(404).json({ message: 'Class not found or unauthorized' });

    // Remove student from the students list
    db.get('students').value()[classId] = db.get('students').value()[classId].filter(s => s.id !== studentId);
    
    // Also remove any attendance records for this student in this class
    db.get('attendance').value()[classId] = db.get('attendance').value()[classId].filter(r => r.studentId !== studentId);
    db.write();

    // Update class stats (student count and rate)
    updateClassStats(classId); 

    res.json({ message: 'Student deleted' });
});


// 7. Take Attendance - Protected Route
app.post('/api/attendance/:classId', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const records = req.body.records.map(record => ({ 
        ...record, 
        studentId: parseInt(record.studentId) // Ensure studentId is numeric
    }));
    
    // Check if class belongs to user
    const cls = db.get('classes').find({ id: classId, userId: req.user.userId }).value();
    if (!cls) return res.status(404).json({ message: 'Class not found or unauthorized' });

    // Append new records to the attendance history for the class
    db.get('attendance').value()[classId].push(...records);
    db.write();

    // Update class stats
    updateClassStats(classId); 

    // Return the updated classes and attendance lists to refresh the app state
    const updatedClasses = db.get('classes').filter({ userId: req.user.userId }).value();
    const updatedAttendance = db.get('attendance').value();
    
    // Filter attendance to only return relevant data for the user's classes
    const userClassIds = updatedClasses.map(c => c.id);
    const userAttendance = {};
    Object.keys(updatedAttendance).forEach(id => {
        if (userClassIds.includes(parseInt(id))) {
            userAttendance[id] = updatedAttendance[id];
        }
    });

    res.json({ 
        message: 'Attendance recorded successfully',
        classes: updatedClasses,
        attendance: userAttendance
    });
});


// --- Server Start ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
