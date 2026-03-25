# 🎓 Student Management System

A full-stack web application built with **React**, **Node.js + Express**, and **MongoDB**.

---

## 📁 Project Structure

//As runs on MongoDB Compass
1. Install MongoDB
2. Start MongoDB service
3. Go to backend folder → run: npm install
4. Run: npm start

5. Go to frontend folder → run: npm install
6. Run: npm start

Note: Project uses local MongoDB (mongodb://localhost:27017)

“I used MongoDB locally with Compass. It can be easily switched to Atlas for deployment.”

```
sms/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection
│   │   ├── middleware/
│   │   │   └── errorHandler.js   # Central error handler
│   │   ├── models/
│   │   │   └── Student.js        # Mongoose schema
│   │   ├── routes/
│   │   │   └── students.js       # All CRUD endpoints
│   │   └── server.js             # Express app entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── StudentForm.jsx   # Add/Edit form with validation
    │   │   └── UI.jsx            # Shared components (Modal, Toast, etc.)
    │   ├── hooks/
    │   │   └── useStudents.js    # Custom hooks for data fetching
    │   ├── services/
    │   │   └── api.js            # Axios API calls
    │   ├── App.jsx               # Main application
    │   └── index.js
    └── package.json
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node.js |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |

---

## 🚀 Setup & Run

### Step 1 — Start MongoDB

**On macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**On Ubuntu/Linux:**
```bash
sudo systemctl start mongod
```

**On Windows:**
```bash
# Open Services and start "MongoDB" — or run:
net start MongoDB
```

**Verify MongoDB is running:**
```bash
mongosh
# You should see the MongoDB shell prompt
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to backend folder
cd sms/backend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

---

### Step 3 — Set Up the Frontend

Open a **second terminal**:

```bash
# Navigate to frontend folder
cd sms/frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The app will open at **http://localhost:3000** in your browser.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List all students (supports filters) |
| GET | `/students/stats` | Get aggregate stats |
| GET | `/students/:id` | Get a single student |
| POST | `/students` | Add a new student |
| PUT | `/students/:id` | Update a student |
| DELETE | `/students/:id` | Delete a student |

### Query Parameters for GET /students

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name, roll, or email |
| `dept` | string | Filter by department |
| `status` | string | Filter by Active / Inactive |
| `year` | string | Filter by year |
| `sort` | string | Sort field (default: `createdAt`) |
| `order` | string | `asc` or `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

### Example API Calls

```bash
# Get all students
curl http://localhost:5000/api/students

# Search for a student
curl "http://localhost:5000/api/students?search=arjun"

# Filter by department
curl "http://localhost:5000/api/students?dept=Computer+Science&status=Active"

# Add a student
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjun Kumar",
    "roll": "CS2021001",
    "email": "arjun@uni.edu",
    "phone": "9876543210",
    "dept": "Computer Science",
    "year": "3rd Year",
    "gpa": 8.9,
    "status": "Active"
  }'

# Update a student
curl -X PUT http://localhost:5000/api/students/<id> \
  -H "Content-Type: application/json" \
  -d '{"gpa": 9.1}'

# Delete a student
curl -X DELETE http://localhost:5000/api/students/<id>

# Get stats
curl http://localhost:5000/api/students/stats
```

---

## ⚙️ Environment Variables

The backend uses `backend/.env`. You can modify:

```env
PORT=5000                                          # Express server port
MONGO_URI=mongodb://localhost:27017/student_management  # MongoDB connection string
NODE_ENV=development
```

For a remote MongoDB (e.g. MongoDB Atlas), replace MONGO_URI with your Atlas connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_management
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Validation | express-validator (backend) + custom (frontend) |
| Dev Tools | nodemon, morgan |

---

## 🛠 Troubleshooting

**"MongoDB connection error"**
→ Make sure MongoDB is running (`mongod` service is active).

**"CORS error" in browser**
→ Make sure backend is on port 5000 and frontend on port 3000. Check `server.js` CORS config.

**"Cannot find module"**
→ Run `npm install` inside both `backend/` and `frontend/` folders.

**Frontend shows "Make sure backend is running"**
→ Start the backend first (`npm run dev` inside `backend/`), then start the frontend.
