📚 Student Attendance Tracker (React Native & Node.js API)

This is a comprehensive mobile application designed for instructors to manage classes, enroll students, record attendance, and view performance reports. The application uses a React Native (Expo) frontend connected to a custom Node.js/Express API for data persistence.

🚀 Key Features

Secure Authentication: User login and registration integrated with a local API using JWT for session management.

Data Isolation: User-specific data (classes, students, attendance) are correctly scoped via the authenticated userId.

Class Management: Create, view, and manage individual classes with descriptive details.

Student Enrollment: Add and remove students from specific classes.

Attendance Tracking: Dedicated screen to quickly mark students as Present/Absent for any session.

Real-time Reports: Automatically calculated class attendance rates displayed on the Dashboard and Reports screens.

🛠️ Setup and Installation

Prerequisites

You must have the following installed on your development machine:

Node.js (v18+ recommended)

Yarn or npm

Expo Go app on your mobile device, or a mobile emulator.

Step 1: Backend (API Server) Setup

The backend uses Express and LowDB to handle authentication and store data in db.json.

Navigate to the backend directory.

cd backend/


Install dependencies.

npm install
# OR
yarn install


Start the API Server. The server runs on port 3000.

node server.js


Console Output: Server listening at http://localhost:3000

Step 2: Frontend (React Native) Setup

Go back to the project root directory.

cd ..


Install frontend dependencies.

npm install
# OR
yarn install


Crucial Step: Update the API Endpoint

The app must connect to your local network IP. The API_BASE_URL in src/context/AppContext.js has been configured using your known IP address.

// Current setting in src/context/AppContext.js
const API_BASE_URL = '[http://192.168.186.1:3000/api](http://192.168.186.1:3000/api)'; 


⚠️ IMPORTANT: If your local IP address (192.168.186.1) changes, you must manually update this value in src/context/AppContext.js to avoid network errors.

Start the React Native App.

npm start
# OR
expo start


Run on Device: Scan the QR code displayed in the terminal or browser with the Expo Go app on your mobile device.

🔑 Default Credentials

Use the following credentials, pre-populated in db.json, to test the authenticated flow immediately:

Field

Value

Email

teacher@example.com

Password

password123

📂 Project Structure Overview

.
├── backend/
│   ├── server.js     # Express API and LowDB handlers
│   └── db.json       # Local data store
├── src/
│   ├── context/
│   │   └── AppContext.js   # Global state, API communication, Auth logic
│   ├── components/
│   │   ├── Header.js       # Custom navigation header
│   │   ├── StudentCard.js  # Displays student info for lists
│   │   └── (Other UI components...)
│   └── screens/
│       ├── LoginScreen.js
│       ├── DashboardScreen.js
│       └── (All other screen views...)
└── App.js          # Main navigation (Stack & Tabs) setup
