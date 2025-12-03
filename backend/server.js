const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./src/config/db");

// 1. Import Routes
const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

// 2. Import Swagger Configuration (Vital for the assignment)
const swaggerDocs = require("./src/config/swagger");

dotenv.config();
connectDB();

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Use the variable imported at top
app.use("/api/tasks", taskRoutes); // Use the variable imported at top

// Root
app.get("/", (req, res) => res.send("API is running..."));

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // 3. Initialize Swagger Documentation
  swaggerDocs(app, PORT);
});
