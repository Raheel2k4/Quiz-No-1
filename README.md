# 📚 Student Attendance Tracker  
### *(React Native + Node.js/Express API with LowDB)*

A complete mobile application for instructors to manage classes, enroll students, record attendance, and view performance analytics.  
Frontend built with **React Native (Expo)** and backend powered by **Node.js/Express** with **LowDB** for lightweight persistence.

---

## 🚀 Key Features

### 🔐 Secure Authentication
- JWT-based login and registration.
- Each user accesses only their own data through user-scoped resources.

### 🗂️ Class Management
- Create, view, and manage classes.

### 🧑‍🎓 Student Enrollment
- Add/remove students to/from classes.
- Student lists are isolated per instructor.

### ✔️ Attendance Tracking
- Quickly mark each student as **Present** or **Absent**.
- Automatically records timestamped attendance sessions.

### 📊 Real-time Reports & Analytics
- Attendance percentages per student and per class.
- Dashboard overview for fast insights.

---

## 🛠️ Setup and Installation

### **Prerequisites**
- **Node.js v18+**
- **npm or yarn**
- **Expo Go** (on mobile device) or an emulator

---

## Step 1: Backend (API Server) Setup

The backend uses **Express + LowDB** to handle authentication and CRUD operations.

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
Keep this running during development.

Step 2: Frontend (React Native) Setup
Return to the project root:

bash
Copy code
cd ..
Install frontend dependencies:
bash
Copy code
npm install
# or
yarn install
🔧 Crucial Step: Update the API Endpoint
Mobile devices cannot access localhost from your computer.
Update the API URL inside:

src/context/AppContext.js

Find:

js
Copy code
const API_BASE_URL = 'http://192.168.186.1:3000/api';
Replace 192.168.186.1 with your current local IPv4 address.

Check your local IP using:

Windows: ipconfig

macOS/Linux: ifconfig

Start the React Native App
bash
Copy code
npm start
# or
expo start
Scan the QR code with your Expo Go app to run on your device.

🔑 Default Test Credentials
Field	Value
Email	teacher@example.com
Password	password123

You may also create a new account using Sign Up.

📂 Project Structure
graphql
Copy code
.
├── backend/
│   ├── server.js        # Express API server (auth, CRUD, reports)
│   └── db.json          # LowDB JSON storage
│
├── src/
│   ├── context/
│   │   └── AppContext.js    # Global state, API calls, user session
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
└── App.js               # Navigation (Stack + Tab navigators)