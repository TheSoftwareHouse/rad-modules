import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import * as RandExp from "randexp";
import { ActivationTokenUtils } from "../tokens/activation-token-utils";
import { JwtUtils } from "../tokens/jwt-utils";
import { XSecurityTokenUtils } from "../tokens/x-security-token-utils";
import fetch from "node-fetch";

export async function registerUtils(container: AwilixContainer, appConfig: AppConfig) {
  const passwordGenerator = new RandExp(appConfig.passwordRegex);
  passwordGenerator.max = appConfig.resetPassword.randomMaxLength;

  const apiKeyGenerator = new RandExp(appConfig.apiKeyRegex);

  // const activationTokenUtils = new ActivationTokenUtils({ userActivationConfig: appConfig.userActivationConfig });
  container.register({
    activationTokenUtils: awilix.asClass(ActivationTokenUtils).singleton(),
    passwordGenerator: awilix.asValue(passwordGenerator),
    apiKeyGenerator: awilix.asValue(apiKeyGenerator),
    jwtUtils: awilix.asClass(JwtUtils).singleton(),
    xSecurityTokenUtils: awilix.asClass(XSecurityTokenUtils).singleton(),
    myFetch: awilix.asFunction(() => fetch),
  });

  return container;
}
