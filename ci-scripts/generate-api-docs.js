const fs = require("fs");
const path = require("path");

const services = ["security"];

const API_KEY_HEADER_NAME = "x-api-key";
const projectRootPath = path.join(__dirname, "..");

services.forEach((serviceName) => {
  const { swaggerFactory } = require(`../build/services/${serviceName}/src/app/applications/http/swagger-factory`);
  const actionsPath = `${projectRootPath}/build/services/${serviceName}/src/**/actions/*.js`;
  const errorsPath = `${projectRootPath}/build/services/${serviceName}/src/errors/*.js`;
  const swaggerJsonDefinition = swaggerFactory(API_KEY_HEADER_NAME, actionsPath, errorsPath);
  fs.writeFileSync(
    `${projectRootPath}/api-docs/${serviceName}.json`,
    Buffer.from(JSON.stringify(swaggerJsonDefinition, null, 2)),
  );
});
