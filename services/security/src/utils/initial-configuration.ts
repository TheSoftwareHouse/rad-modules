import { InitialUsers } from "../init/initial-users";
import { InitialPolicy } from "../init/initial-policies";
import { InitialApiKeys } from "../init/initial-api-keys";

interface InitialConfigurationProps {
  initialUsers: InitialUsers;
  initialPolicy: InitialPolicy;
  initialApiKeys: InitialApiKeys;
  initialData: InitialData;
}

export interface InitialData {
  usersData: any;
  policyData: any;
  apiKeysData: any;
}

export class InitialConfiguration {
  constructor(private dependencies: InitialConfigurationProps) {}

  public async init() {
    const { initialUsers, initialPolicy, initialApiKeys, initialData } = this.dependencies;
    await initialUsers.update(initialData.usersData);
    await initialPolicy.update(initialData.policyData);
    await initialApiKeys.update(initialData.apiKeysData);
  }
}
