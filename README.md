# ⚡ Skill Gap Analyzer

A full-stack web application that helps professionals identify skill gaps, get match percentages, and receive personalized learning recommendations for their target job roles.

---

## 🚀 Features

- 🔐 **JWT Authentication** — Secure register & login with bcrypt password hashing
- 🧠 **Skill Manager** — Add, remove, and save your current skills with autocomplete
- 🎯 **8+ Job Roles** — Frontend, Backend, Full Stack, Data Science, DevOps, and more
- 📊 **Skill Gap Analysis** — Instant match percentage with matched vs missing skills
- 📚 **Learning Recommendations** — Curated resources for every missing skill
- ✨ **Full Animations** — Particle canvas, floating orbs, tag pops, progress bars

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, Axios     |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| Auth       | JWT, bcryptjs                     |
| Styling    | Custom CSS with CSS Variables     |

---

## 📁 Project Structure

```
analyzer/
│
├── Server/                      ← Express.js backend
│   ├── models/
│   │   ├── User.js              ← User schema (name, email, password, skills)
│   │   └── JobRole.js           ← JobRole schema (role, requiredSkills)
│   ├── routes/
│   │   ├── auth.js              ← POST /api/auth/register, /api/auth/login
│   │   └── analyzer.js          ← GET /api/profile, PUT /api/skills,
│   │                               GET /api/jobs, POST /api/analyze
│   ├── middleware/
│   │   └── authMiddleware.js    ← JWT verification middleware
│   ├── server.js                ← Express app, MongoDB connect, job seeding
│   ├── .env                     ← Environment variables
│   └── package.json
│
└── src/                         ← React.js frontend
    ├── pages/
    │   ├── Home.jsx             ← Landing page with particle canvas
    │   ├── Login.jsx            ← Login form with split layout
    │   ├── Register.jsx         ← Register with password strength meter
    │   ├── Dashboard.jsx        ← Main app: skills + analyze + results
    │   └── About.jsx            ← Project info, team, roadmap
    ├── App.js                   ← Router, AuthContext, ProtectedRoute
    ├── index.js                 ← React entry point
    ├── index.css                ← Global styles + all CSS animations
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone / Download the project

```bash
cd analyzer
```

### 2. Setup & Run the Backend

```bash
cd Server
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET, PORT)
npm run dev        # uses nodemon for hot-reload
# OR
npm start          # production start
```

The server starts at **http://localhost:5000**

Job roles are **auto-seeded** on first startup.

### 3. Setup & Run the Frontend

```bash
# From the analyzer/ root folder
npm install
npm start
```

The React app opens at **http://localhost:3000**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint               | Description         | Auth Required |
|--------|------------------------|---------------------|---------------|
| POST   | /api/auth/register     | Register new user   | ❌            |
| POST   | /api/auth/login        | Login user          | ❌            |

### User & Skills
| Method | Endpoint               | Description         | Auth Required |
|--------|------------------------|---------------------|---------------|
| GET    | /api/profile           | Get user profile    | ✅            |
| PUT    | /api/skills            | Update user skills  | ✅            |

### Jobs & Analysis
| Method | Endpoint               | Description         | Auth Required |
|--------|------------------------|---------------------|---------------|
| GET    | /api/jobs              | List all job roles  | ✅            |
| POST   | /api/analyze           | Run skill gap analysis | ✅         |

---

## 🧠 Skill Gap Algorithm

```javascript
const missingSkills = requiredSkills.filter(
  skill => !userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
);

const matchPercentage = Math.round(
  ((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100
);
```

---

## 🎨 Pages Overview

| Page       | Route        | Description                                      |
|------------|--------------|--------------------------------------------------|
| Home       | /            | Landing with particle canvas + feature showcase  |
| Login      | /login       | Split-layout login with animated form            |
| Register   | /register    | Registration with password strength meter        |
| Dashboard  | /dashboard   | 3-tab app: Skills → Analyze → Results            |
| About      | /about       | Project info, tech stack, team roles, roadmap    |

---

## 👥 Team Roles

| Member | Responsibility                        |
|--------|---------------------------------------|
| 1      | React UI — pages, components, styling |
| 2      | Backend APIs — Express, routes, JWT   |
| 3      | Database — MongoDB, Mongoose, seeding |
| 4      | Logic & Integration — algorithm, Axios|

---

## 🚢 Deployment (Optional)

| Service   | Purpose          |
|-----------|------------------|
| Vercel    | React frontend   |
| Render    | Express backend  |
| MongoDB Atlas | Cloud database |

---

## 📄 Environment Variables (Server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillgapanalyzer
JWT_SECRET=your_super_secret_key_here
```

---

Built with ❤️ as an internship project.
