const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskMaster API",
      version: "1.0.0",
      description:
        "A scalable REST API for managing tasks with Authentication and RBAC",
      contact: {
        name: "Backend Intern Candidate",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log(`📄 Docs available at http://localhost:${port}/api-docs`);
};

module.exports = swaggerDocs;
