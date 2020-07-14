import { name, version, description } from "../../../../package.json";

const jsdoc = require("swagger-jsdoc");

function swaggerFactory(
  apiKeyHeaderName: string = "x-api-key", // eslint-disable-line
  actionsPath: string = "src/**/actions/*.js",
  errorsPath: string = "src/errors/*.js",
) {
  return jsdoc({
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
    apis: [actionsPath, errorsPath],
  });
}

export { swaggerFactory };
