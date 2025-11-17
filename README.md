# 📚 Student Attendance Tracker (React Native & Node.js API)

A complete mobile application for instructors to manage classes, enroll students, record attendance, and generate performance reports. Built using **React Native (Expo)** for the frontend and **Node.js/Express** with **LowDB** for backend data persistence.

---

## 🚀 Features

### 🔐 Secure Authentication

* Login & registration system using **JWT**.
* Local API integration with persisted session tokens.

### 🗂️ Data Isolation

* All classes, students, and attendance data is scoped per **authenticated userId**.

### 🎓 Class Management

* Create, view, and manage classes with detailed info.

### 👨‍🎓 Student Enrollment

* Add/remove students from any class.
* Designed for fast classroom management.

### ✅ Attendance Tracking

* Quick Present/Absent marking.
* Records multiple class sessions.

### 📊 Real-time Reports

* Automatically calculated attendance percentages.
* Dashboard & Reports screen summaries.

---

## 🛠️ Setup and Installation

### **Prerequisites**

Make sure you have installed:

* **Node.js (v18+)**
* **Yarn or npm**
* **Expo Go** (mobile device) or an emulator

---

## 📡 Step 1: Backend (API Server) Setup

Navigate to the backend folder:

```bash
cd backend/
```

Install dependencies:

```bash
npm install
# OR
yarn install
```

Start the server:

```bash
node server.js
```

Server will run at:

```
http://localhost:3000
```

---

## 📱 Step 2: Frontend (React Native App) Setup

Go back to the project root:

```bash
cd ..
```

Install dependencies:

```bash
npm install
# OR
yarn install
```

### 🔗 Important: Set Your Local API Endpoint

In:

```
src/context/AppContext.js
```

Update:

```js
const API_BASE_URL = "http://192.168.186.1:3000/api";
```

⚠️ **If your local IP changes, update this URL.**

Start the mobile app:

```bash
npm start
# OR
expo start
```

Open the app using **Expo Go** by scanning the QR code.

---

## 🔑 Default Test Credentials

| Field    | Value                                             |
| -------- | ------------------------------------------------- |
| Email    | [teacher@example.com](mailto:teacher@example.com) |
| Password | password123                                       |

These credentials are preloaded inside `db.json`.

---

## 📂 Project Structure

```
.
├── backend/
│   ├── server.js           
│   └── db.json             
├── src/
│   ├── context/
│   │   └── AppContext.js   
│   ├── components/
│   │   ├── Header.js
│   │   ├── StudentCard.js
│   │   └── (More components...)
│   └── screens/
│       ├── LoginScreen.js
│       ├── DashboardScreen.js
│       └── (All screens...)
└── App.js
```

---

## ⭐ Contributions

Feel free to submit **issues** or **pull requests** to improve this project.

---

## 👨‍🏫 Author

Student Attendance Tracker built with ❤️ for educational use.
