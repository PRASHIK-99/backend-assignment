TaskMaster - Scalable Backend API

A secure, scalable REST API built with Node.js, Express, and MongoDB, featuring Role-Based Access Control (RBAC) and a React frontend.

🚀 Features

Authentication: Secure User Registration & Login (BCrypt password hashing).

Authorization: JWT-based protection with Role-Based Access (Admin vs User).

Validation: Robust input validation using Joi middleware.

Security: HelmetJS for headers, CORS configured, secure error handling.

Documentation: Integrated Swagger UI.

Frontend: React + TailwindCSS dashboard for testing APIs.

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Validation: Joi

Auth: JWT (JSON Web Tokens)

Frontend: React, TailwindCSS, Lucide Icons

📂 Project Structure

/backend
/src
/config # DB & Swagger Config
/controllers # Business Logic
/middleware # Auth & Validation
/models # Database Schemas
/routes # API Routes
/validators # Joi Schemas
server.js # Entry Point
/frontend # React UI

⚡ Getting Started

Prerequisites

Node.js (v14+)

MongoDB (Local or Atlas URL)

1. Backend Setup

cd backend
npm install

# Create a .env file based on the example below

npm run dev

Environment Variables (.env):

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

2. Frontend Setup

cd frontend
npm install
npm run dev

📚 API Documentation

Once the server is running, visit the auto-generated Swagger docs:
👉 http://localhost:5000/api-docs

🧪 API Endpoints

Method

Endpoint

Description

Access

POST

/api/auth/register

Register new user

Public

POST

/api/auth/login

Login user

Public

GET

/api/tasks

Get all tasks

Private (User/Admin)

POST

/api/tasks

Create task

Private

PUT

/api/tasks/:id

Update task

Private

DELETE

/api/tasks/:id

Delete task

Private

📈 Scalability

For details on how this system handles growth, caching strategies, and architecture decisions, please read SCALABILITY.md.

Built for Backend Developer Internship Assignment.
