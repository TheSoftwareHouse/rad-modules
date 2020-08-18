import { PolicyRepository } from "../policy.repository";
import { createKeycloakFilter, QueryObject } from "../helpers/query-filter";
import { PolicyModelGeneric } from "../../app/features/policy/models/policy.model";

export class PolicyKeycloakRepository implements PolicyRepository {
  constructor(private dependencies: any) {}

  public async addPolicy(policy: PolicyModelGeneric) {
    const { keycloakManager } = this.dependencies;
    const newPolicy = await keycloakManager.addPolicy(policy);
    return newPolicy;
  }

  public async findBy(params: any) {
    const { keycloakManager } = this.dependencies;
    const policies = await keycloakManager.getPolicies();

    if (params.id) {
      return policies.filter((policy: any) => policy.id === params.id);
    }

    if (params.resource && params.attribute) {
      return policies.filter(
        (policy: any) => policy.resource === params.resource && policy.attribute === params.attribute,
      );
    }

    if (params.resource) {
      return policies.filter((policy: any) => policy.resource === params.resource);
    }

    if (params.attribute) {
      return policies.filter((policy: any) => policy.attribute === params.attribute);
    }

    return policies;
  }

  public async delete(ids: string[]): Promise<any> {
    const { keycloakManager } = this.dependencies;

    /* eslint-disable no-await-in-loop */
    while (ids.length) {
      await keycloakManager.removePolicy(ids.pop());
    }
    /* eslint-enable no-await-in-loop */

    return Promise.resolve();
  }

  public findByResourcesAndAttributes(_resources: string[], _attributes: string[]): Promise<PolicyModelGeneric[]> {
    throw new Error("Not implemented");
  }

  public async getNamesByAttributes(attributes: string[] = []): Promise<string[]> {
    const { keycloakManager } = this.dependencies;
    const policies = await keycloakManager.getPolicies();
    return policies
      .filter((policy: any) => attributes.includes(policy.attribute))
      .map((policy: any) => policy.resource);
  }

  public async getPolicies(queryObject: QueryObject) {
    const { keycloakManager } = this.dependencies;
    const filterObjects = createKeycloakFilter(queryObject);
    let policies = await keycloakManager.getPolicies();

    policies = policies.filter((policyItem: any) =>
      filterObjects.reduce((item, filterObject, index, array) => {
        if (!item) {
          return false;
        }

        const result = filterObject.filterFunction(item);

        if (result) {
          return item;
        }

        if (index < array.length - 1 && !filterObject.or) {
          return false;
        }

        if (index === array.length - 1) {
          return false;
        }

        return item;
      }, policyItem),
    );

    policies.sort((a: string, b: string) =>
      queryObject.order.type === "asc"
        ? a[queryObject.order.by].localeCompare(b[queryObject.order.by])
        : b[queryObject.order.by].localeCompare(a[queryObject.order.by]),
    );

    const offset = (queryObject.page - 1) * queryObject.limit;
    policies = policies.slice(offset, offset + queryObject.limit);

    return { policies, total: policies.length };
  }
}
