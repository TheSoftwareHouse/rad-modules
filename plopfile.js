const { copySync, mkdirpSync, pathExistsSync } = require("fs-extra");
const path = require("path");

const servicesLocation = path.join(__dirname, "services/");
const serviceTemplateLocation = path.join(__dirname, "shared/service-template/");

module.exports = plop => {
  plop.setActionType("createService", answers => {
    const newServiceLocation = path.join(servicesLocation, answers.serviceName);
    if (pathExistsSync(newServiceLocation)) {
      throw Error(`A service with the name "${answers.serviceName}" already exists.`);
    }
    mkdirpSync(newServiceLocation);
    copySync(`${serviceTemplateLocation}/static/`, newServiceLocation);
    return "Success";
  });

  plop.setGenerator("rad-generator", {
    description: "Create new service",
    prompts: [serviceNamePrompt, serviceVersionPrompt, serviceDescriptionPrompt],
    actions: [createService, createDockerEntrypoint, createDockerFileProd, createPackageJson, createIntegrationTest],
  });
};

// Prompts

const serviceNamePrompt = {
  type: "input",
  name: "serviceName",
  message: "Service name",
};

const serviceVersionPrompt = {
  type: "input",
  name: "serviceVersion",
  message: "Version",
  default: "1.0.0",
};

const serviceDescriptionPrompt = {
  type: "input",
  name: "serviceDescription",
  message: "Description",
  default: "",
};

// Actions

const createService = {
  type: "createService",
  answer: "{{serviceName}}",
};

const createDockerEntrypoint = {
  type: "add",
  path: "./services/{{serviceName}}/docker/prod/docker-entrypoint.sh",
  templateFile: "./shared/service-template/plop-templates/docker-entrypoint.sh",
};

const createDockerFileProd = {
  type: "add",
  path: "./services/{{serviceName}}/docker/prod/Dockerfile",
  templateFile: "./shared/service-template/plop-templates/dockerfile.prod",
};

const createPackageJson = {
  type: "add",
  path: "./services/{{serviceName}}/package.json",
  templateFile: "./shared/service-template/plop-templates/package.json",
};

const createIntegrationTest = {
  type: "add",
  path: "./services/{{serviceName}}/src/integration-tests/{{serviceName}}.spec.ts",
  templateFile: "./shared/service-template/plop-templates/service.spec.ts",
};
