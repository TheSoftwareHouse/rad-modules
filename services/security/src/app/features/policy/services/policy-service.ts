import { AdminPanelPoliciesConfig } from "../../../../config/config";

export interface PolicyServiceProps {
  adminPanelPolicies: AdminPanelPoliciesConfig;
  superAdminRoleName: string;
}

export class PolicyService {
  constructor(private dependencies: PolicyServiceProps) {}

  public getDefaultPoliciesResources() {
    const { adminPanelPolicies } = this.dependencies;

    const policiesResources = Object.entries(adminPanelPolicies).map(
      ([_key, adminPanelPolicyItem]) => adminPanelPolicyItem.resource,
    );

    return [...new Set(policiesResources)];
  }

  public getDefaultPoliciesAttributes() {
    const { adminPanelPolicies, superAdminRoleName } = this.dependencies;

    const policiesAttributes = Object.entries(adminPanelPolicies).map(
      ([_key, adminPanelPolicyItem]) => adminPanelPolicyItem.attribute,
    );
    const policiesAttributesWithoutSuperAdmin = policiesAttributes.filter(
      (attribute) => attribute !== superAdminRoleName,
    );

    return [...new Set(policiesAttributesWithoutSuperAdmin)];
  }
}
