import { name, version, description } from "../../../../../../package.json";

const jsdoc = require("swagger-jsdoc");

export default jsdoc({
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: name,
      version,
      description,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          in: "header",
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
  apis: ["src/**/actions/*.js"],
});
