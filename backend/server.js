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

// Function to safely retrieve all relevant user data (classes, students, attendance)
function getUserData(userId) {
    const userClasses = db.get('classes').filter({ userId: userId }).value();
    const userClassIds = userClasses.map(c => c.id);
    const userStudents = {};
    const userAttendance = {};

    // Filter students cache to only include classes owned by the user
    Object.keys(db.get('students').value()).forEach(classId => {
        // IDs are stored as strings in the students/attendance cache keys
        if (userClassIds.includes(parseInt(classId))) {
            userStudents[classId] = db.get('students').value()[classId];
        }
    });

    // Filter attendance cache to only include classes owned by the user
    Object.keys(db.get('attendance').value()).forEach(classId => {
        if (userClassIds.includes(parseInt(classId))) {
            userAttendance[classId] = db.get('attendance').value()[classId];
        }
    });

    return { classes: userClasses, students: userStudents, attendance: userAttendance };
}


// Calculates the total attendance rate for a class and updates its record
function updateClassStats(classId) {
    const classIdStr = classId.toString();
    const classAttendance = db.get('attendance').value()[classIdStr] || [];
    const classStudents = db.get('students').value()[classIdStr] || [];

    const totalStudents = classStudents.length;

    // Calculate total attendance count (total records across all dates)
    const totalRecords = classAttendance.length;
    const presentRecords = classAttendance.filter(r => r.present).length;

    let attendanceRate = 0;
    if (totalRecords > 0) {
        // Rate is calculated based on total present vs total records
        attendanceRate = Math.round((presentRecords / totalRecords) * 100);
    }
    
    // Update the class record with calculated stats
    db.get('classes')
        .find({ id: parseInt(classId) })
        .assign({
            students: totalStudents,
            attendanceRate: attendanceRate
        })
        .write();
}

// --- API Router ---
const apiRouter = express.Router();
apiRouter.use(bodyParser.json());

// --- User Registration (Register) ---
apiRouter.post('/register', (req, res) => {
    const { name, email, password, displayName } = req.body;

    if (!name || !email || !password || !displayName) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (db.get('users').find({ email: email.toLowerCase() }).value()) {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Determine the next user ID
    // 1. Get all existing IDs (which might be numbers or strings like 'u1')
    // 2. Convert to numbers, ignoring non-numeric parts and default to 0
    // 3. Find the maximum
    // 4. Add 1
    const maxId = Math.max(
        0,
        // FIX: Coerce 'id' to a string before calling replace() to handle numeric IDs from LowDB
        ...db.get('users').map('id').value().map(id => parseInt(String(id).replace('u', '')) || 0),
    );
    const newId = maxId + 1;

    // Create new user object
    const newUser = {
        // Use an integer ID for simplicity, matching other data keys
        id: newId, 
        name,
        email: email.toLowerCase(),
        password, // NOTE: In a real app, hash this password!
        displayName,
    };

    // Save the new user
    db.get('users').push(newUser).write();

    // Generate JWT token
    const token = jwt.sign({ userId: newId, name: newUser.name, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({ 
        message: 'Registration successful. Please login.',
        token, // For immediate login after registration if desired
    });
});

// --- User Login (Login) ---
apiRouter.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.get('users').find({ email: email.toLowerCase() }).value();

    // Check if user exists and password is correct (simple comparison for this mock server)
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // Return token and user display info
    res.json({ 
        message: 'Login successful', 
        token,
        displayName: user.displayName,
    });
});


// --- Get Initial Data (Authenticated) ---
apiRouter.get('/data', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const { classes, students, attendance } = getUserData(userId);
    
    // Also send back the user's display name for profile setup
    const userProfile = db.get('users').find({ id: userId }).value();
    const displayName = userProfile ? userProfile.displayName : 'Instructor';

    res.json({
        classes,
        students,
        attendance,
        displayName,
        userId: userId.toString(), // Ensure userId is always a string for client-side state consistency
    });
});

// --- Update Instructor Name (Authenticated) ---
apiRouter.post('/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { displayName } = req.body;

    if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ message: 'Display name cannot be empty.' });
    }

    // Find and update the user's displayName
    db.get('users')
        .find({ id: userId })
        .assign({ displayName: displayName.trim() })
        .write();

    res.json({
        message: 'Display name updated successfully',
        displayName: displayName.trim(),
    });
});


// --- Class Management ---

// Add new class
apiRouter.post('/classes', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Class name is required.' });
    }
    
    // Determine the next class ID
    const maxId = Math.max(0, ...db.get('classes').map('id').value());
    const newId = maxId + 1;

    const newClass = {
        id: newId,
        userId: userId, // Link class to the creator/instructor
        name: name.trim(),
        students: 0, // Initial count
        attendanceRate: 0, // Initial rate
        createdAt: new Date().toISOString(),
    };

    db.get('classes').push(newClass).write();

    // Initialize student and attendance storage for the new class
    db.get('students').value()[newId.toString()] = [];
    db.get('attendance').value()[newId.toString()] = [];
    db.write();

    // Return all classes for the user to update client state
    const { classes: updatedClasses } = getUserData(userId);

    res.status(201).json({ 
        message: 'Class added successfully',
        classes: updatedClasses,
        newClass: newClass
    });
});

// Delete a class
apiRouter.delete('/classes/:classId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);

    // Ensure the class exists and belongs to the user
    const classToDelete = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!classToDelete) {
        return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // 1. Remove the class from the classes array
    db.get('classes').remove({ id: classId }).write();

    // 2. Remove students cache for this class
    delete db.get('students').value()[classId.toString()];

    // 3. Remove attendance history for this class
    delete db.get('attendance').value()[classId.toString()];
    
    db.write(); // Commit changes after removing data from the objects

    // Return updated data
    const { classes: updatedClasses } = getUserData(userId);

    res.json({ 
        message: 'Class and all associated data deleted successfully',
        classes: updatedClasses
    });
});


// --- Student Management ---

// Add a new student to a class
apiRouter.post('/classes/:classId/students', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const { name, registrationNumber } = req.body;

    if (!name || !registrationNumber) {
        return res.status(400).json({ message: 'Name and registration number are required.' });
    }

    // 1. Verify class ownership
    const targetClass = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!targetClass) {
        return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    const classStudentsKey = classId.toString();
    const currentStudents = db.get('students').value()[classStudentsKey] || [];

    // 2. Determine next student ID (unique within the class)
    const maxId = Math.max(0, ...currentStudents.map(s => s.id));
    const newId = maxId + 1;

    const newStudent = {
        id: newId, // Unique ID within the class
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        joinedAt: new Date().toISOString(),
    };

    // 3. Add the student
    db.get('students').value()[classStudentsKey].push(newStudent);

    // 4. Update class stats (student count)
    updateClassStats(classId); 

    db.write();

    // Return updated students and classes
    const { classes: updatedClasses, students: updatedStudents } = getUserData(userId);

    res.status(201).json({
        message: 'Student enrolled successfully',
        students: updatedStudents,
        classes: updatedClasses
    });
});

// Delete a student from a class
apiRouter.delete('/classes/:classId/students/:studentId', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);

    // 1. Verify class ownership
    const targetClass = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!targetClass) {
        return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    const classStudentsKey = classId.toString();
    
    // 2. Remove the student from the class's student list
    const studentsArray = db.get('students').value()[classStudentsKey];
    if (studentsArray) {
        db.get('students').value()[classStudentsKey] = studentsArray.filter(s => s.id !== studentId);
    }

    // 3. Remove all attendance records for this student from the class's attendance history
    const attendanceArray = db.get('attendance').value()[classStudentsKey];
    if (attendanceArray) {
        db.get('attendance').value()[classStudentsKey] = attendanceArray.filter(r => r.studentId !== studentId);
    }

    // 4. Update class stats (student count and attendance rate)
    updateClassStats(classId); 

    db.write();

    // Return updated students and classes
    const { classes: updatedClasses, students: updatedStudents, attendance: updatedAttendance } = getUserData(userId);

    res.json({
        message: 'Student dropped successfully',
        students: updatedStudents,
        classes: updatedClasses,
        attendance: updatedAttendance
    });
});

// --- Attendance Management ---

// Record attendance for a class
apiRouter.post('/classes/:classId/attendance', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const { date, records } = req.body; // records is an array of { studentId, present }

    if (!date || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'Date and attendance records are required.' });
    }

    // Verify class ownership
    const targetClass = db.get('classes').find({ id: classId, userId: userId }).value();
    if (!targetClass) {
        return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Map and format the incoming records for storage
    const formattedRecords = records.map(record => ({
        date: date,
        studentId: parseInt(record.studentId),
        present: record.present,
    }));

    const classAttendanceKey = classId.toString();
    // Append new records to the attendance history for the class
    // NOTE: This simple version allows multiple attendance submissions for the same date/student.
    // A robust system would check for and overwrite existing records for the same date.
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
  "classes": [ { id: 101, userId: 1, name, students: 0, attendanceRate: 0, createdAt: "..." } ],
  "students": { 
    "101": [ { id: 1, name, registrationNumber, joinedAt: "..." } ],
    "102": [ ... ]
  },
  "attendance": {
    "101": [ { date: "YYYY-MM-DD", studentId: 1, present: true } ],
    "102": [ ... ]
  }
}
*/
