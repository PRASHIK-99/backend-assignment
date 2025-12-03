const Joi = require("joi");

// --- Auth Schemas ---

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "Name should be a type of text",
    "string.empty": "Name cannot be an empty field",
    "string.min": "Name should have a minimum length of 3",
    "any.required": "Name is a required field",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- Task Schemas ---

const createTaskSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().allow("").optional(),
  status: Joi.string()
    .valid("pending", "in-progress", "completed")
    .default("pending"),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("pending", "in-progress", "completed"),
}).min(1); // Ensure at least one field is being updated

module.exports = {
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
};
