import { UsersRepository } from "../repositories/users.repostiory";
import { PolicyRepository } from "../repositories/policy.repository";
import { JwtUtils } from "../tokens/jwt-utils";
import { KeycloakManager } from "../utils/keycloak/keycloak-manager";

export interface AuthorizationClientProps {
  usersRepository: UsersRepository;
  policyRepository: PolicyRepository;
  jwtUtils: JwtUtils;
  superAdminRoleName: string;
  keycloakManager: KeycloakManager;
}

export interface AuthorizationClient {
  isSuperAdmin: (accessToken: string) => Promise<boolean>;
  hasAccess: (accessToken: string, resource: string) => Promise<boolean>;
  hasAttributes: (accessToken: string, attributes: string[]) => Promise<boolean>;
}
