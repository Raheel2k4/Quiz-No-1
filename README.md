<div align="center">

# 📚 Student Attendance Tracker  
### React Native (Expo) + Node.js/Express API + LowDB

A complete mobile attendance management system for instructors — including authentication, class management, student enrollment, attendance tracking, and real-time performance reports.

---

### 🚀 Tech Stack
**Frontend:** React Native (Expo)  
**Backend:** Node.js + Express  
**Database:** LowDB (JSON-based storage)  
**Auth:** JSON Web Tokens (JWT)

---

</div>

---

## ✨ Features

### 🔐 Authentication
- Secure login and registration
- JWT-based sessions
- User-specific (isolated) data storage

### 🗂️ Class Management
- Create and manage classes
- Students and attendance scoped per instructor

### 🧑‍🎓 Student Enrollment
- Add or remove students from a class
- Clean UI with reusable components

### ✔️ Attendance Tracking
- Mark students **Present/Absent** quickly
- Time-stamped attendance entries

### 📊 Real-Time Reports
- Attendance percentages
- Class and student performance summaries
- Dashboard overview for insights

---

## 🛠️ Installation & Setup

### 📌 Prerequisites
- Node.js **v18+**
- npm or yarn
- Expo Go (or mobile emulator)

---

# 1️⃣ Backend Setup (API Server)

```bash
cd backend/
Install dependencies:
bash
Copy code
npm install
# or
yarn install
Start the server:
bash
Copy code
node server.js
You should see:

arduino
Copy code
Server listening at http://localhost:3000
Keep this running while using the app.

2️⃣ Frontend Setup (React Native)
Go back to project root:

bash
Copy code
cd ..
Install frontend dependencies:

bash
Copy code
npm install
# or
yarn install
🔧 IMPORTANT: Update API Base URL
Open:

bash
Copy code
src/context/AppContext.js
Find:

js
Copy code
const API_BASE_URL = 'http://192.168.186.1:3000/api';
Replace 192.168.186.1 with your computer’s current local IPv4 address.

Check yours via:

Windows: ipconfig

Mac/Linux: ifconfig

▶️ Run the App
bash
Copy code
npm start
# or
expo start
On a device
Scan the QR code using Expo Go.

🔑 Default Login for Testing
Field	Value
Email	teacher@example.com
Password	password123

(You can also register a new account.)

📁 Project Structure
graphql
Copy code
.
├── backend/
│   ├── server.js        # Express API logic (auth, CRUD, reporting)
│   └── db.json          # LowDB storage file
│
├── src/
│   ├── context/
│   │   └── AppContext.js        # Global state & API handler
│   ├── components/
│   │   ├── Header.js
│   │   ├── StudentCard.js
│   │   └── ...
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── DashboardScreen.js
│       ├── ClassesScreen.js
│       └── ...
│
└── App.js               # Navigation setup (Stack + Tabs)
<div align="center">
🎉 You're All Set!
If you'd like:
✨ UI improvements
✨ API enhancements
✨ Deployment guides
✨ Database migrations
Just ask — happy to help!

</div> ```