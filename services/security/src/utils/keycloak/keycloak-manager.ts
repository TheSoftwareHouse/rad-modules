import fetch from "node-fetch";
import { HttpError } from "../../errors/http.error";
import * as queryString from "querystring";
import { ConflictError } from "../../errors/conflict.error";
import { PolicyModelGeneric } from "../../app/features/policy/models/policy.model";
import { UserModelGeneric } from "../../app/features/users/models/user.model";
import { NotFoundError } from "../../errors/not-found.error";
import { BadRequestError } from "../../errors/bad-request.error";
import * as jwt from "jsonwebtoken";
import { UnathorizedError } from "../../errors/unathorized.error";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

export class KeycloakManager {
  constructor(private dependencies: any) {}

  public async setCredentials() {
    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/token`;

    const body = queryString.stringify({
      username: this.dependencies.keycloakManagerConfig.clientUsername,
      password: this.dependencies.keycloakManagerConfig.clientPassword,
      client_secret: this.dependencies.keycloakManagerConfig.clientSecret,
      grant_type: this.dependencies.keycloakManagerConfig.grantType,
      client_id: this.dependencies.keycloakManagerConfig.clientId,
    });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }

      return {
        accessToken: jsonData.access_token,
        refreshToken: jsonData.refresh_token,
      };
    });
  }

  public async login(username: string, password: string) {
    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/token`;

    const body = queryString.stringify({
      username,
      password,
      client_secret: this.dependencies.keycloakManagerConfig.clientSecret,
      grant_type: this.dependencies.keycloakManagerConfig.grantType,
      client_id: this.dependencies.keycloakManagerConfig.clientId,
      scope: "openid",
    });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).then(async (response) => {
      const textData = await response.text();
      if (response.status >= 400) {
        throw new HttpError(textData, response.status);
      }

      const jsonData = JSON.parse(textData) as any;

      const idToken = jwt.decode(jsonData.id_token) as any;

      if (!idToken.user_id) {
        throw new HttpError("No user_id property in idToken. Wrong keycloak configuration.", INTERNAL_SERVER_ERROR);
      }

      return {
        userId: idToken.user_id,
        accessToken: jsonData.access_token,
        refreshToken: jsonData.refresh_token,
      };
    });
  }

  public async refreshToken(refreshToken: string) {
    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/token`;

    const body = queryString.stringify({
      client_secret: this.dependencies.keycloakManagerConfig.clientSecret,
      grant_type: "refresh_token",
      client_id: this.dependencies.keycloakManagerConfig.clientId,
      refresh_token: refreshToken,
    });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }

      const idToken = jwt.decode(jsonData.id_token) as any;

      return {
        userId: idToken.user_id,
        accessToken: jsonData.access_token,
        refreshToken: jsonData.refresh_token,
      };
    });
  }

  public async resetPassword(username: string, password: string) {
    const user = await this.findUserByUsername(username);

    if (!user) {
      throw new NotFoundError("User not exists.");
    }

    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users/${user.id}`;

    const updatePassword = {
      type: "password",
      value: password,
      temporary: false,
    };

    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(updatePassword),
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData;
    });
  }

  public async setNewPassword(userName: string, oldPassword: string, newPassword: string) {
    await this.login(userName, oldPassword).catch(() => {
      throw new BadRequestError("Can't set new password");
    });

    const user = await this.findUserByUsername(userName);

    if (!user) {
      throw new NotFoundError("User not exists.");
    }

    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users/${user.id}`;

    const updatePassword = {
      type: "password",
      value: newPassword,
      temporary: false,
    };

    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(updatePassword),
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData;
    });
  }

  public async getPolicies() {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }

      const policies: PolicyModelGeneric[] = [];
      jsonData
        .filter((resource: any) => resource.type === "resources:default")
        .forEach((resource: any) => {
          resource.attributes.attributes.forEach((attribute: string) => {
            policies.push({
              id: `${resource._id}-${attribute}`,
              attribute,
              resource: resource.name,
            });
          });
        });
      return policies;
    });
  }

  public async addPolicy(policy: PolicyModelGeneric) {
    const policies = await this.getPolicies();
    const credentials = await this.setCredentials();
    const duplicated = policies.some(
      (_policy) => _policy.resource === policy.resource && _policy.attribute === policy.attribute,
    );
    if (duplicated) {
      throw new ConflictError("Policy already exists.");
    }
    const resourceExist = policies.find((_policy) => _policy.resource === policy.resource);

    if (resourceExist) {
      // update
      const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource`;

      return fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      }).then(async (response) => {
        const jsonData = await response.json();
        if (response.status >= 400) {
          throw new HttpError(jsonData.error, response.status);
        }

        const resourceToUpdate = jsonData.find(
          (resource: any) => resource.type === "resources:default" && resource.name === policy.resource,
        );
        resourceToUpdate.attributes.attributes.push(policy.attribute);
        const updateUrl = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource/${resourceToUpdate._id}`;
        return fetch(updateUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
          body: JSON.stringify({ ...resourceToUpdate, scopes: [] }),
        }).then(async (resp) => {
          if (resp.status >= 400) {
            throw new HttpError("Error", resp.status);
          }
          return { ...policy, id: `${resourceToUpdate._id}-${policy.attribute}` };
        });
      });
    }
    // create new
    const createUrl = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource`;
    const newPolicy = {
      scopes: [],
      attributes: { attributes: policy.attribute },
      uris: [],
      name: policy.resource,
      ownerManagedAccess: "",
      displayName: policy.resource,
      type: "resources:default",
    };
    return fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(newPolicy),
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }
      await this.addPermission(policy.resource);
      return jsonData;
    });
  }

  public async removePolicy(id: string) {
    const data = id.split("-");
    const attribute = data.pop();
    const resource = data.join("-");

    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }
      const resourceToUpdate = jsonData.find((res: any) => res.type === "resources:default" && res._id === resource);
      if (resourceToUpdate) {
        const resourceAttributes = resourceToUpdate.attributes.attributes.filter((attr: any) => attr !== attribute);

        if (resourceAttributes.length === 0) {
          // remove resource
          const removeUrl = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource/${resourceToUpdate._id}`;
          return fetch(removeUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
          }).then(async (resp) => {
            if (resp.status >= 400) {
              throw new HttpError("Error", resp.status);
            }
            await this.removePermission(resourceToUpdate.name);
          });
        }
        // update resource
        resourceToUpdate.attributes.attributes = resourceAttributes;
        const updateUrl = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource/${resourceToUpdate._id}`;
        return fetch(updateUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
          body: JSON.stringify({ ...resourceToUpdate, scopes: [] }),
        }).then(async (resp) => {
          if (resp.status >= 400) {
            throw new HttpError("Error", resp.status);
          }
        });
      }
      return undefined;
    });
  }

  public async getUsers() {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users?briefRepresentation=false`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }
      // const users: UserModelGeneric[] = jsonData.map((user: any) => this.mapKeycloakUser(user));
      // return users;
      return jsonData;
    });
  }

  public async addUser(user: UserModelGeneric) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users`;

    const newUser = {
      username: user.username,
      email: user.username,
      emailVerified: user.isActive,
      enabled: user.isActive,
      attributes: {
        attributes: user.attributes,
        activationToken: user.activationToken,
      },
      firstName: user.username,
      lastName: "",
      credentials: [
        {
          type: "password",
          value: user.password,
          temporary: false,
        },
      ],
    };

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(newUser),
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData;
    });
  }

  public async findUserByUsername(username: string) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users?username=${username}&briefRepresentation=false`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData.find((user: any) => user.username === username);
    });
  }

  public async findUserById(id: string) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${
      this.dependencies.keycloakManagerConfig.realmName
    }/users?max=${0x7fffffff}&briefRepresentation=false`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData.find((user: any) => user.id === id);
    });
  }

  public async findUserByActivationToken(activationToken: string) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${
      this.dependencies.keycloakManagerConfig.realmName
    }/users?max=${0x7fffffff}&briefRepresentation=false`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData.find((user: any) => user?.attributes?.acctivationToken?.includes(activationToken));
    });
  }

  public async findUserByResetPasswordToken(resetPasswordToken: string) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${
      this.dependencies.keycloakManagerConfig.realmName
    }/users?max=${0x7fffffff}&briefRepresentation=false`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData.find((user: any) => user?.attributes?.resetPasswordToken?.includes(resetPasswordToken));
    });
  }

  public async updateUser(user: UserModelGeneric) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users/${user.id}`;

    let userCredentials;

    if (user.password) {
      userCredentials = [
        {
          type: "password",
          value: user.password,
          temporary: false,
        },
      ];
    }

    const updatedUser = {
      username: user.username,
      email: user.username,
      emailVerified: user.isActive,
      enabled: user.isActive,
      attributes: {
        attributes: user.attributes,
        activationToken: user.activationToken,
      },
      firstName: user.username,
      lastName: "",
      credentials: userCredentials,
    };

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(updatedUser),
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }

      return jsonData;
    });
  }

  public async removeUser(id: string) {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/users/${id}`;

    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    })
      .then(async (response) => {
        const data = await response.text();
        const jsonData = data ? JSON.parse(data) : {};
        if (response.status >= 400) {
          throw new HttpError(JSON.stringify(jsonData), response.status);
        }
      })
      .catch(() => {});
  }

  public async checkPermission(accessToken: string, permission: string) {
    const { jwtUtils, accessTokenConfig } = this.dependencies;

    const tokenPayload = jwt.decode(accessToken) as any;
    if (tokenPayload?.type === "user") {
      const validToken = jwtUtils.verifyToken(accessToken, accessTokenConfig);
      if (!validToken) {
        throw new UnathorizedError("Invalid token");
      }
      return (tokenPayload.policy || []).some((resource: string) => resource === permission);
    }

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/token`;
    const body = queryString.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
      audience: "rad-security",
      permission,
    });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${accessToken}` },
      body,
    })
      .then(async (response) => {
        const data = await response.text();
        const jsonData = data ? JSON.parse(data) : {};
        if (response.status >= 400) {
          throw new HttpError(JSON.stringify(jsonData), response.status);
        }
        return true;
      })
      .catch(() => false);
  }

  public async checkToken(accessToken: string) {
    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/userinfo`;

    const { jwtUtils, accessTokenConfig } = this.dependencies;

    const tokenPayload = jwt.decode(accessToken) as any;
    if (tokenPayload?.type === "user") {
      const validToken = jwtUtils.verifyToken(accessToken, accessTokenConfig);
      if (!validToken) {
        throw new UnathorizedError("Invalid token");
      }
      return tokenPayload;
    }

    return fetch(url, {
      method: "GET",
      headers: { Authorization: `bearer ${accessToken}` },
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }
      return jsonData;
    });
  }

  public async getKeycloakPermissions() {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${
      this.dependencies.keycloakManagerConfig.realmName
    }/clients/${
      this.dependencies.keycloakManagerConfig.radSecurityClientId
    }/authz/resource-server/permission?max=${0x7fffffff}`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }
      return jsonData;
    });
  }

  public async getKeycloakPolicies() {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${
      this.dependencies.keycloakManagerConfig.realmName
    }/clients/${
      this.dependencies.keycloakManagerConfig.radSecurityClientId
    }/authz/resource-server/policy?max=${0x7fffffff}`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }
      return jsonData;
    });
  }

  public async getKeycloakResources() {
    const credentials = await this.setCredentials();

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/resource`;

    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(jsonData.error, response.status);
      }
      return jsonData.filter((resource: any) => resource.type === "resources:default");
    });
  }

  public async addPermission(resourceName: string) {
    const credentials = await this.setCredentials();
    const resources = await this.getKeycloakResources();
    const resourceId = resources.find((resource: any) => resource.name === resourceName)._id;
    const policies = await this.getKeycloakPolicies();
    const abacId = policies.find((policy: any) => policy.name === "abac").id;
    const createUrl = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/clients/${this.dependencies.keycloakManagerConfig.radSecurityClientId}/authz/resource-server/permission/resource`;
    const newPermission = {
      name: resourceName,
      type: "resource",
      logic: "POSITIVE",
      decisionStrategy: "UNANIMOUS",
      resources: [resourceId],
      policies: [abacId],
    };

    return fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
      body: JSON.stringify(newPermission),
    }).then(async (response) => {
      const jsonData = await response.json();
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }
      return jsonData;
    });
  }

  public async removePermission(permissionName: string) {
    const credentials = await this.setCredentials();

    const permissions = await this.getKeycloakPermissions();
    const permissionId = permissions.find((permission: any) => permission.name === permissionName)?.id;

    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/admin/realms/${this.dependencies.keycloakManagerConfig.realmName}/permission/${permissionId}`;

    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `bearer ${credentials.accessToken}` },
    })
      .then(async (response) => {
        const data = await response.text();
        const jsonData = data ? JSON.parse(data) : {};
        if (response.status >= 400) {
          throw new HttpError(JSON.stringify(jsonData), response.status);
        }
      })
      .catch(() => {});
  }

  public async verifyToken(accessToken: string) {
    const url = `${this.dependencies.keycloakManagerConfig.keycloakUrl}/auth/realms/${this.dependencies.keycloakManagerConfig.realmName}/protocol/openid-connect/token`;
    const body = queryString.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
      audience: "rad-security",
    });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `bearer ${accessToken}` },
      body,
    }).then(async (response) => {
      const data = await response.text();
      const jsonData = data ? JSON.parse(data) : {};
      if (response.status >= 400) {
        throw new HttpError(JSON.stringify(jsonData), response.status);
      }
      return jsonData;
    });
  }
}
