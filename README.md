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
