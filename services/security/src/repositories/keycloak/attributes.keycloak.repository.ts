import { QueryObject } from "../helpers/query-filter";
import { AttributesRepository } from "../attributes.repostiory";
import { UserModelGeneric } from "../../app/features/users/models/user.model";

export class AttributesKeycloakRepository implements AttributesRepository {
  constructor(private dependencies: any) {}

  public async getAttributes(_queryObject: QueryObject) {
    // const { keycloakManager } = this.dependencies;
    // const newPolicy = await keycloakManager.addPolicy(policy);
    return {
      attributes: [],
      total: 0,
    };
  }

  public async delete(_ids: string[]) {
    // return;
  }

  public async doesUserAlreadyHaveAttributes({ _user, _attributes }: { user: UserModelGeneric; attributes: string[] }) {
    // return attributesFound.map(({ name }) => name);
    return [];
  }
}
