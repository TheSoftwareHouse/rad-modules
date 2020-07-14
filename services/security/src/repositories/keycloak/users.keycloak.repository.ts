import { UsersRepository } from "../users.repostiory";
import { createKeycloakFilter, QueryObject } from "../helpers/query-filter";
import { UserModelGeneric } from "../../app/features/users/models/user.model";
import { PolicyModelGeneric } from "../../app/features/policy/models/policy.model";
import { AttributeModelGeneric } from "../../app/features/users/models/attribute.model";

export class UsersKeycloakRepository implements UsersRepository {
  constructor(private dependencies: any) {}

  private mapKeycloakUser(keycloakUser: any): UserModelGeneric {
    return {
      id: keycloakUser.id,
      username: keycloakUser.username,
      password: "",
      passwordSalt: "",
      attributes:
        keycloakUser?.attributes?.attributes?.map((attribute: string) => ({
          name: attribute,
          user: keycloakUser.id,
          id: `${keycloakUser.id}-${attribute}`,
        })) || [],
      isActive: keycloakUser.emailVerified,
      activationToken: null,
      activationTokenExpireDate: null,
      deactivationDate: null,
      resetPasswordToken: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }

  public async addUser(user: UserModelGeneric) {
    const { keycloakManager } = this.dependencies;
    await keycloakManager.addUser(user);

    const userExist = await keycloakManager.findUserByUsername(user.username);
    if (userExist) {
      await keycloakManager.updateUser(user);
    } else {
      await keycloakManager.addUser(user);
    }
    return user;
  }

  public async findByUsername(username: string) {
    const { keycloakManager } = this.dependencies;
    const user = await keycloakManager.findUserByUsername(username);
    return user ? this.mapKeycloakUser(user) : undefined;
  }

  public async findById(id: string) {
    const { keycloakManager } = this.dependencies;
    const user = await keycloakManager.findUserById(id);

    return user ? this.mapKeycloakUser(user) : undefined;
  }

  public async findByActivationToken(activationToken: string) {
    const { keycloakManager } = this.dependencies;
    const user = await keycloakManager.findUserByActivationToken(activationToken);

    return user ? this.mapKeycloakUser(user) : undefined;
  }

  public async getAllUsersDisplayModel() {
    const { keycloakManager } = this.dependencies;
    const users = await keycloakManager.getUsers();

    return users
      .map((user: any) => this.mapKeycloakUser(user))
      .map((user: UserModelGeneric) => ({
        id: user.id,
        createdAt: user.createdAt,
        updateddAt: user.updatedAt,
        isActive: user.isActive,
      }));
  }

  public async getUsers(queryObject: QueryObject) {
    const { keycloakManager } = this.dependencies;
    const filterObjects = createKeycloakFilter(queryObject);
    let users = await keycloakManager.getUsers();

    users = users
      .map((user: any) => this.mapKeycloakUser(user))
      .filter((userItem: UserModelGeneric) =>
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
        }, userItem),
      );

    users.sort((a: string, b: string) =>
      queryObject.order.type === "asc"
        ? a[queryObject.order.by].localeCompare(b[queryObject.order.by])
        : b[queryObject.order.by].localeCompare(a[queryObject.order.by]),
    );

    const offset = (queryObject.page - 1) * queryObject.limit;
    users = users.slice(offset, offset + queryObject.limit);

    return { users, total: users.length };
  }

  public async getUsersByResourceName(page: number, limit: number, resourceName: string) {
    const { keycloakManager } = this.dependencies;
    const { attributes } = await keycloakManager
      .getPolicies()
      .filter((policy: PolicyModelGeneric) => policy.resource === resourceName)
      .map((policy: PolicyModelGeneric) => policy.attribute);
    let users = await keycloakManager
      .getUsers()
      .map((user: any) => this.mapKeycloakUser(user))
      .filter((user: UserModelGeneric) =>
        user.attributes
          .map((attribute: AttributeModelGeneric) => attribute.name)
          .some((attribute: string) => attributes.includes(attribute)),
      );

    const offset = (page - 1) * limit;
    users = users.slice(offset, offset + limit);

    return { users, total: users.length };
  }

  public async getUserIdByUsername(username: string) {
    const { keycloakManager } = this.dependencies;
    const user = await keycloakManager.findUserByUsername(username ?? "");

    return user?.id ?? "";
  }

  public async findUserByResetPasswordToken(resetPasswordToken: string) {
    const { keycloakManager } = this.dependencies;
    const user = await keycloakManager.findUserByResetPasswordToken(resetPasswordToken);

    return this.mapKeycloakUser(user);
  }

  public async delete(ids: string[]) {
    const { keycloakManager } = this.dependencies;

    /* eslint-disable no-await-in-loop */
    while (ids.length) {
      await keycloakManager.removeUser(ids.pop());
    }
    /* eslint-enable no-await-in-loop */

    return Promise.resolve();
  }

  public async save(user: UserModelGeneric) {
    return this.addUser(user);
  }
}
