import { UserActivationConfig } from "../config/config";
import { hashValue, hashWithSha1 } from "../../../../shared/crypto";
import { ForbiddenError } from "../errors/forbidden.error";

interface ActivationTokenUtilsProps {
  userActivationConfig: UserActivationConfig;
}

export class ActivationTokenUtils {
  constructor(private dependencies: ActivationTokenUtilsProps) {}

  public getActivationToken(value: string, skipConfigurationSettings: boolean = false) {
    const { userActivationConfig } = this.dependencies;
    return userActivationConfig.isUserActivationNeeded || skipConfigurationSettings
      ? hashValue(value, hashWithSha1).hash
      : null;
  }

  public getActivationTokenExpireDate(skipConfigurationSettings: boolean = false) {
    const { userActivationConfig } = this.dependencies;
    const { isUserActivationNeeded, timeToActiveAccountInDays } = userActivationConfig;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + timeToActiveAccountInDays);
    return isUserActivationNeeded || skipConfigurationSettings ? currentDate : null;
  }

  public shouldUserBeActive() {
    const { userActivationConfig } = this.dependencies;
    return !userActivationConfig.isUserActivationNeeded;
  }

  public isTokenExpired(activationTokenExpireDate?: Date | null) {
    if (!activationTokenExpireDate) {
      throw new ForbiddenError("User is missing activation token expire date");
    }

    return Date.now() > activationTokenExpireDate.getTime();
  }
}
