TaskMaster – Scalable Backend API

A secure, production-ready REST API built with Node.js, Express, and MongoDB, featuring Role-Based Access Control (RBAC) and a React dashboard for seamless interaction and testing.

🚀 Features

Authentication: Secure user registration & login using bcrypt password hashing

Authorization: JWT-based protection with Admin/User role-based access

Validation: Strong request validation powered by Joi middleware

Security:

Helmet for secure HTTP headers

CORS protection

Centralized & safe error handling

Documentation: Fully integrated Swagger UI for API visualization

Frontend: React + TailwindCSS dashboard for interacting with the API

🛠️ Tech Stack
Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Joi Validation

Frontend

React

TailwindCSS

Lucide Icons

📂 Project Structure
/backend
  /src
    /config        # Database & Swagger configuration
    /controllers   # Business logic
    /middleware    # Auth & validation middleware
    /models        # Mongoose schemas
    /routes        # API route handlers
    /validators    # Joi validation schemas
  server.js        # Backend entry point

/frontend
  # React UI (TailwindCSS + API testing dashboard)

⚡ Getting Started
Prerequisites

Node.js (v14+ recommended)

MongoDB (Local instance or Atlas)

🔧 Backend Setup
cd backend
npm install


Create a .env file in the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


Run the backend:

npm run dev

🎨 Frontend Setup
cd frontend
npm install
npm run dev

📚 API Documentation

Once the backend server is running, open Swagger UI:

👉 http://localhost:5000/api-docs

🧪 API Endpoints
Method	Endpoint	Description	Access
POST	/api/auth/register	Register new user	Public
POST	/api/auth/login	Login user	Public
GET	/api/tasks	Get all tasks	Private (User/Admin)
POST	/api/tasks	Create task	Private
PUT	/api/tasks/:id	Update task	Private
DELETE	/api/tasks/:id	Delete task	Private
📈 Scalability

For details on caching, system architecture, horizontal scaling, request optimization, and production readiness, refer to:

👉 SCALABILITY.md

Built for Backend Developer Internship Assignment.
