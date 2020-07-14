import { name, version, description } from "../../../../package.json";

const jsdoc = require("swagger-jsdoc");

function swaggerFactory(
  apiKeyHeaderName: string = "x-api-key",
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
      tags: [
        {
          name: "Tokens",
          description: "",
        },
        {
          name: "Users",
          description: "",
        },
        {
          name: "Policy",
          description: "",
        },
      ],
      definitions: {
        ApiKeyHeaderName: {
          in: "header",
          name: apiKeyHeaderName,
          description: "ApiKey that allows generating access tokens.",
          schema: {
            type: "string",
            format: "uuid",
          },
          required: true,
          example: "123e4567-e89b-12d3-a456-426655440000",
        },
      },
    },
    apis: [actionsPath, errorsPath],
  });
}

export { swaggerFactory };
