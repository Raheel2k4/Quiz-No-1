📚 Student Attendance Tracker (React Native & Node.js API)

This is a comprehensive mobile application built with React Native (Expo) for the frontend and a custom Node.js/Express API using LowDB for local data persistence. It allows instructors to manage classes, enroll students, record attendance, and view performance reports.

🚀 Key Features

Secure Authentication: User login and registration integrated with a local API using JWT for session management.

Data Isolation: User-specific data (classes, students, attendance) are correctly scoped via the authenticated userId.

Class Management: Create, view, and manage individual classes.

Student Enrollment: Add and remove students from specific classes.

Attendance Tracking: Dedicated screen to quickly mark students as Present/Absent for a session.

Real-time Reports: Automatically calculated attendance rates displayed on the Dashboard and Reports screens.

🛠️ Setup and Installation

Prerequisites

Node.js (v18+ recommended)

Yarn or npm (for package management)

Expo Go app on your mobile device, or a mobile emulator.

Step 1: Backend (API Server) Setup

The backend handles user authentication and data operations using Express and LowDB (which saves data to db.json).

Navigate to the backend directory.

cd backend/


Install dependencies. (You will need express, body-parser, lowdb, jsonwebtoken).

npm install
# OR
yarn install


Start the API Server. The server runs on port 3000.

node server.js


You should see the output: Server listening at http://localhost:3000. Keep this window running while developing the app.

Step 2: Frontend (React Native) Setup

Go back to the project root directory.

cd ..


Install frontend dependencies.

npm install
# OR
yarn install


Crucial Step: Update the API Endpoint

Because mobile devices cannot access localhost on your development machine, you must update the API_BASE_URL in src/context/AppContext.js to your computer's local IP address.

Current IP Setting in src/context/AppContext.js:

const API_BASE_URL = '[http://192.168.186.1:3000/api](http://192.168.186.1:3000/api)'; 


If your computer's IP address has changed, update 192.168.186.1 to your current local IPv4 address. (Check using ipconfig on Windows or ifconfig on Mac/Linux).

Start the React Native App.

npm start
# OR
expo start


Run on Device: Scan the QR code displayed in the terminal or browser with the Expo Go app on your phone.

🔑 Default Credentials

You can use the following credentials, which are pre-populated in db.json, to test the authenticated flow:

Field

Value

Email

teacher@example.com

Password

password123

You can also create a new account using the Sign Up option.

📂 Project Structure Overview

.
├── backend/
│   ├── server.js     # Express API server logic (handles auth, CRUD, stats)
│   └── db.json       # LowDB database file (persists user data)
├── src/
│   ├── context/
│   │   └── AppContext.js   # Global state, handles API calls, stores user data
│   ├── components/
│   │   ├── Header.js       # Custom header/nav logic
│   │   ├── StudentCard.js  # Displays student info for lists
│   │   └── (Other components...)
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── DashboardScreen.js
│       ├── ClassesScreen.js
│       └── (Other screen files...)
└── App.js          # Main navigation setup (Stack & Tabs)
