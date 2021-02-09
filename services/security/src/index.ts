import { Application } from "./app/application.types";
import { createContainer } from "./container";
import {
  AppConfig,
  appConfig as config,
  appConfigSchema,
  initialPoliciesDataSchema,
  initialUsersDataSchema,
} from "./config/config";
import { createLogger } from "@tshio/logger";

const logger = createLogger({
  LOGGING_LEVEL: config.logger.logLevel,
  APP_NAME: process.env.APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
});

async function validateConfig(appConfig: AppConfig) {
  const configValidationResult = appConfigSchema.validate(appConfig);
  if (configValidationResult.error) {
    throw configValidationResult.error;
  }

  const initialUsersFromFile = await import(appConfig.initialUsersDataJsonPath);
  const initialUsersData = [{ ...appConfig.superAdminUser, isActive: true }, ...initialUsersFromFile];
  const inititalDataValidationResult = initialUsersDataSchema.validate(initialUsersData);
  if (inititalDataValidationResult.error) {
    throw inititalDataValidationResult.error;
  }

  const initialPoliciesDataFromFile = await import(appConfig.initialPoliciesDataJsonPath);
  const initialPoliciesDataFromConfig = Object.values(appConfig.adminPanelPolicies);
  const initialPoliciesData = [...initialPoliciesDataFromFile, ...initialPoliciesDataFromConfig];
  const inititalPoliciesValidationResult = initialPoliciesDataSchema.validate(initialPoliciesData);
  if (inititalPoliciesValidationResult.error) {
    throw inititalPoliciesValidationResult.error;
  }
}

process.on("uncaughtException", (err: any) => {
  logger.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  logger.error(err);
  process.exit(1);
});

(async () => {
  await validateConfig(config);

  const container = await createContainer(config);

  const server: Application = container.resolve("server");

  await server.start();
})().catch((error) => {
  logger.error(error);
  process.exit(1);
});
