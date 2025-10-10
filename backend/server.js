const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_jwt_secret'; // Use a strong, secret key in a real app

// --- MySQL Connection Setup ---
// This pool manages connections to your XAMPP MySQL database.
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',        // Default XAMPP username
    password: '',      // Default XAMPP password
    database: 'attendance_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Using .promise() enables async/await for cleaner code

// --- Middleware ---
app.use(bodyParser.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Contains { userId, name, email }
        next();
    });
};

// --- API Router ---
const apiRouter = express.Router();
apiRouter.use(bodyParser.json());

// --- User Registration (Register) ---
apiRouter.post('/register', async (req, res) => {
    const { name, email, password, displayName } = req.body;

    if (!name || !email || !password || !displayName) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // NOTE: In a real app, you MUST hash the password before storing it!
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, displayName) VALUES (?, ?, ?, ?)',
            [name, email.toLowerCase(), password, displayName]
        );
        const newUserId = result.insertId;

        const token = jwt.sign({ userId: newUserId, name: name, email: email.toLowerCase() }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({
            message: 'Registration successful.',
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Database error during registration.' });
    }
});

// --- User Login (Login) ---
apiRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        const user = users[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            displayName: user.displayName,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Database error during login.' });
    }
});

// --- NEW: Change Password Route ---
apiRouter.post('/change-password', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const user = users[0];

        // IMPORTANT: This is an insecure plain text comparison.
        // In a real production app, you would use a library like bcrypt to compare a hashed password.
        if (user.password !== currentPassword) {
            return res.status(403).json({ message: 'Incorrect current password.' });
        }

        // IMPORTANT: Hash the newPassword before saving it in a real app.
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Database error while changing password.' });
    }
});

// --- Get All User Data (Authenticated) ---
apiRouter.get('/data', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const [userRows] = await db.query('SELECT displayName FROM users WHERE id = ?', [userId]);
        const displayName = userRows.length > 0 ? userRows[0].displayName : 'Instructor';

        const [classes] = await db.query(`
            SELECT 
                c.*,
                COUNT(DISTINCT s.id) AS students,
                IFNULL(ROUND(AVG(a.present) * 100, 1), 0) AS attendanceRate
            FROM classes c
            LEFT JOIN students s ON c.id = s.classId
            LEFT JOIN attendance a ON c.id = a.classId
            WHERE c.userId = ?
            GROUP BY c.id
        `, [userId]);

        const classIds = classes.map(c => c.id);
        const dataPayload = {
            classes: classes,
            students: {},
            attendance: {},
            displayName: displayName,
            userId: userId.toString(),
        };

        if (classIds.length > 0) {
            const [students] = await db.query('SELECT * FROM students WHERE classId IN (?)', [classIds]);
            const [attendance] = await db.query('SELECT * FROM attendance WHERE classId IN (?)', [classIds]);
            
            classIds.forEach(id => {
                dataPayload.students[id] = students.filter(s => s.classId === id);
                dataPayload.attendance[id] = attendance.filter(a => a.classId === id);
            });
        }
        
        res.json(dataPayload);

    } catch (error) {
        console.error('Get Data error:', error);
        res.status(500).json({ message: 'Failed to fetch user data.' });
    }
});


// --- Class Management ---
apiRouter.post('/classes', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Class name is required.' });
    }

    try {
        const [result] = await db.query('INSERT INTO classes (userId, name) VALUES (?, ?)', [userId, name.trim()]);
        const newClassId = result.insertId;
        
        const [newClassRows] = await db.query('SELECT * FROM classes WHERE id = ?', [newClassId]);
        const newClass = {
            ...newClassRows[0],
            students: 0,
            attendanceRate: 0
        };

        res.status(201).json({
            message: 'Class added successfully',
            newClass: newClass
        });
    } catch (error) {
        console.error('Add Class error:', error);
        res.status(500).json({ message: 'Database error while adding class.' });
    }
});

apiRouter.delete('/classes/:classId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);

    try {
        await db.query('DELETE FROM classes WHERE id = ? AND userId = ?', [classId, userId]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete Class error:', error);
        res.status(500).json({ message: 'Database error while deleting class.' });
    }
});

// --- Student Management ---
apiRouter.post('/classes/:classId/students', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const { name, registrationNumber } = req.body;

    if (!name || !registrationNumber) {
        return res.status(400).json({ message: 'Name and registration number are required.' });
    }

    try {
        const [classes] = await db.query('SELECT id FROM classes WHERE id = ? AND userId = ?', [classId, userId]);
        if (classes.length === 0) {
            return res.status(404).json({ message: 'Class not found or unauthorized.' });
        }

        const [result] = await db.query(
            'INSERT INTO students (classId, name, registrationNumber) VALUES (?, ?, ?)',
            [classId, name.trim(), registrationNumber.trim()]
        );
        
        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (error) {
        console.error('Add Student error:', error);
        res.status(500).json({ message: 'Database error while enrolling student.' });
    }
});

apiRouter.delete('/classes/:classId/students/:studentId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);

    try {
        const [classes] = await db.query('SELECT id FROM classes WHERE id = ? AND userId = ?', [classId, userId]);
        if (classes.length === 0) {
            return res.status(404).json({ message: 'Class not found or unauthorized.' });
        }
        
        await db.query('DELETE FROM students WHERE id = ? AND classId = ?', [studentId, classId]);

        res.json({ message: 'Student dropped successfully' });
    } catch (error) {
        console.error('Delete Student error:', error);
        res.status(500).json({ message: 'Database error while dropping student.' });
    }
});

// --- Attendance Management ---
apiRouter.post('/classes/:classId/attendance', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const classId = parseInt(req.params.classId);
    const { date, records } = req.body;

    if (!date || !records || Object.keys(records).length === 0) {
        return res.status(400).json({ message: 'Date and attendance records are required.' });
    }

    try {
        const [classes] = await db.query('SELECT id FROM classes WHERE id = ? AND userId = ?', [classId, userId]);
        if (classes.length === 0) {
            return res.status(404).json({ message: 'Class not found or unauthorized.' });
        }

        const studentIdsForDate = Object.keys(records);
        if(studentIdsForDate.length > 0) {
            await db.query('DELETE FROM attendance WHERE classId = ? AND date = ? AND studentId IN (?)', [classId, date, studentIdsForDate]);
        
            const values = Object.entries(records).map(([studentId, present]) => {
                return [classId, parseInt(studentId), date, present];
            });
            
            await db.query('INSERT INTO attendance (classId, studentId, date, present) VALUES ?', [values]);
        }

        res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
        console.error('Take Attendance error:', error);
        res.status(500).json({ message: 'Database error while recording attendance.' });
    }
});

// --- Final Setup ---
app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`✅ Server listening at http://localhost:${port}`);
});
