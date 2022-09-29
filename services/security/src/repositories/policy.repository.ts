import { QueryObject } from "./helpers/query-filter";
import { PolicyModelGeneric } from "../app/features/policy/models/policy.model";

export interface PolicyRepository {
  addPolicy: (policy: PolicyModelGeneric) => Promise<PolicyModelGeneric>;
  findBy: (params: object) => Promise<PolicyModelGeneric[]>;
  delete: (ids: string[]) => Promise<any>;
  findByResourcesAndAttributes: (resources: string[], attributes: string[]) => Promise<PolicyModelGeneric[]>;
  getNamesByAttributes: (attributes: string[]) => Promise<string[]>;
  getPolicies: (queryObject: QueryObject) => Promise<{
    policies: PolicyModelGeneric[];
    total: number;
  }>;
}
