const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false return all errors, not just the first one
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Create a nice error message array
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: errorMessages,
      });
    }

    next();
  };
};

module.exports = validate;
