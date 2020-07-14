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
      tags: [
        {
          name: "PDF",
          description: "",
        },
      ],
    },
    apis: [actionsPath, errorsPath],
  });
}

export { swaggerFactory };
