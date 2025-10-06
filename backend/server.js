const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_jwt_secret'; // Use a strong, secret key in a real app

// --- LowDB Setup ---
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize DB structure if it doesn't exist
db.defaults({ users: [], classes: [], students: {}, attendance: {} }).write();

// --- Middleware ---
app.use(bodyParser.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // { userId: id, name: name, email: email }
        next();
    });
};

// --- Helper Functions ---

// Calculates the total attendance rate for a class
function updateClassStats(classId) {
    const classIdStr = classId.toString();
    
    const studentsInClass = db.get('students').value()[classIdStr] || [];
    const attendanceRecords = db.get('attendance').value()[classIdStr] || [];

    const totalStudents = studentsInClass.length;
    
    let totalSessions = 0;
    let totalPresent = 0;

    // Group records by date to find the number of unique sessions
    const sessions = attendanceRecords.reduce((acc, record) => {
        if (!acc[record.date]) {
            acc[record.date] = [];
        }
        acc[record.date].push(record);
        return acc;
    }, {});

    totalSessions = Object.keys(sessions).length;

    // Calculate total present students across all sessions
    Object.values(sessions).forEach(sessionRecords => {
        totalPresent += sessionRecords.filter(r => r.present).length;
    });

    // Total possible attendance checks (Total Students * Total Sessions)
    const totalPossibleChecks = totalStudents * totalSessions;
    
    let attendanceRate = 0;
    if (totalPossibleChecks > 0) {
        attendanceRate = Math.round((totalPresent / totalPossibleChecks) * 100);
    }

    // Update the class document
    db.get('classes')
        .find({ id: parseInt(classIdStr) })
        .assign({ 
            students: totalStudents, 
            attendanceRate: attendanceRate,
            totalSessions: totalSessions, // Store sessions count for reports
        })
        .write();
}

// Helper to generate unique numeric IDs
let nextId = Math.max(
    ...db.get('users').map('id').value().map(id => parseInt(id.replace('u', '')) || 0),
    ...db.get('classes').map('id').value().map(id => parseInt(id) || 0),
    100
) + 1;

function getNextId() {
    return nextId++;
}

// --- API Router ---
const apiRouter = express.Router();

// Helper to fetch user-specific data
const getUserData = (userId) => {
    const userClasses = db.get('classes').filter({ userId: userId }).value();
    const userClassIds = userClasses.map(c => c.id.toString());
    
    // Filter students and attendance to only include data for the user's classes
    const allStudents = db.get('students').value();
    const userStudents = {};
    userClassIds.forEach(id => {
        if (allStudents[id]) {
            userStudents[id] = allStudents[id];
        }
    });

    const allAttendance = db.get('attendance').value();
    const userAttendance = {};
    userClassIds.forEach(id => {
        if (allAttendance[id]) {
            userAttendance[id] = allAttendance[id];
        }
    });

    return {
        classes: userClasses,
        students: userStudents,
        attendance: userAttendance,
    };
};

// --- AUTH ROUTES ---

// POST /api/register
apiRouter.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email, and password' });

    const existingUser = db.get('users').find({ email: email }).value();
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const userId = getNextId();
    const newUser = { id: userId, name, email, password, displayName: name }; // Simplified password storage for demo
    
    db.get('users').push(newUser).write();

    // Generate JWT token with user information
    const token = jwt.sign({ userId: userId, name: name, email: email }, SECRET_KEY, { expiresIn: '24h' });

    // Return the token and user data
    res.json({ token, user: { id: userId, name, email, displayName: name } });
});

// POST /api/login
apiRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.get('users').find({ email: email, password: password }).value(); // Simple login check

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

    // Return the token and user data
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, displayName: user.name } });
});


// --- INITIAL DATA FETCH (AFTER LOGIN) ---

// GET /api/data - Fetches all data for the authenticated user
apiRouter.get('/data', authenticateToken, (req, res) => {
    const { userId } = req.user;
    const data = getUserData(userId);
    res.json(data);
});


// --- CLASS MANAGEMENT ROUTES ---

// POST /api/classes - Add a new class
apiRouter.post('/classes', authenticateToken, (req, res) => {
    const { name } = req.body;
    const newClassId = getNextId();
    const userId = req.user.userId;

    const newClass = {
        id: newClassId,
        userId: userId, // Link class to user
        name,
        students: 0,
        attendanceRate: 0,
    };

    db.get('classes').push(newClass).write();
    
    // Initialize students and attendance entries for the new class
    db.get('students').value()[newClassId.toString()] = [];
    db.get('attendance').value()[newClassId.toString()] = [];
    db.write();

    // Return updated classes list
    res.status(201).json({ 
        message: 'Class added successfully', 
        classes: db.get('classes').filter({ userId: userId }).value(),
        newClass: newClass
    });
});


// --- STUDENT MANAGEMENT ROUTES ---

// POST /api/classes/:classId/students - Add a student to a class
apiRouter.post('/classes/:classId/students', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const { name, registrationNumber } = req.body;
    const userId = req.user.userId;

    const classDoc = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!classDoc) return res.status(404).json({ message: 'Class not found or unauthorized' });

    const studentId = getNextId();
    const newStudent = {
        id: studentId,
        name,
        registrationNumber,
        classId: classId,
    };

    const classStudentsKey = classId.toString();
    db.get('students').value()[classStudentsKey].push(newStudent);
    db.write();

    // Update class student count
    updateClassStats(classId); 

    // Return updated students for the class and updated classes list
    const updatedStudents = db.get('students').value()[classStudentsKey];
    const updatedClasses = db.get('classes').filter({ userId: userId }).value();

    res.status(201).json({ 
        message: 'Student enrolled successfully', 
        students: updatedStudents,
        classes: updatedClasses
    });
});

// DELETE /api/classes/:classId/students/:studentId - Drop a student from a class
apiRouter.delete('/classes/:classId/students/:studentId', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);
    const userId = req.user.userId;

    const classDoc = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!classDoc) return res.status(404).json({ message: 'Class not found or unauthorized' });

    const classStudentsKey = classId.toString();
    
    // 1. Remove student from the student list
    const initialStudents = db.get('students').value()[classStudentsKey] || [];
    const updatedStudents = initialStudents.filter(s => s.id !== studentId);
    db.get('students').value()[classStudentsKey] = updatedStudents;

    // 2. Remove all attendance records for this student in this class
    const initialAttendance = db.get('attendance').value()[classStudentsKey] || [];
    const updatedAttendance = initialAttendance.filter(r => r.studentId !== studentId);
    db.get('attendance').value()[classStudentsKey] = updatedAttendance;
    
    db.write();
    
    // 3. Update class stats (student count, attendance rate)
    updateClassStats(classId); 
    
    // Return updated data
    const updatedClasses = db.get('classes').filter({ userId: userId }).value();
    const updatedAttendanceFull = getUserData(userId).attendance;

    res.json({ 
        message: 'Student dropped successfully',
        students: updatedStudents,
        classes: updatedClasses,
        attendance: updatedAttendanceFull
    });
});


// --- ATTENDANCE ROUTES ---

// POST /api/classes/:classId/attendance - Record attendance for a class
apiRouter.post('/classes/:classId/attendance', authenticateToken, (req, res) => {
    const classId = parseInt(req.params.classId);
    const { date, records } = req.body;
    const userId = req.user.userId;

    const classDoc = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!classDoc) return res.status(404).json({ message: 'Class not found or unauthorized' });

    // Validate records structure and date
    if (!date || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'Invalid attendance data provided.' });
    }

    // Format and append records
    const formattedRecords = records.map(record => ({
        date: date, // Attach the session date to each record
        studentId: record.studentId,
        present: record.present,
    }));

    const classAttendanceKey = classId.toString();
    // Append new records to the attendance history for the class
    db.get('attendance').value()[classAttendanceKey].push(...formattedRecords);
    db.write();

    // Update class stats (attendance rate)
    updateClassStats(classId); 
    
    // Return the updated classes and attendance lists to refresh the app state
    const { classes: updatedClasses, attendance: userAttendance } = getUserData(userId);

    res.json({ 
        message: 'Attendance recorded successfully',
        classes: updatedClasses,
        attendance: userAttendance
    });
});


// Attach the API router
app.use('/api', apiRouter);

// --- Simple Greeting Routes for Browser Check ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Student Attendance Tracker API! Use the /api/ endpoint for services.' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'API is running successfully.' });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

/* Expected JSON payload structure for LowDB:
{
  "users": [ { id: 1, name, email, password, displayName } ],
  "classes": [ { id: 101, userId: 1, name, students, attendanceRate } ],
  "students": { "101": [ { id: 201, name, registrationNumber, classId: 101 } ] },
  "attendance": { "101": [ { date: "2023-10-06", studentId: 201, present: true } ] }
}
*/
