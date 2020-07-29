import { AlreadyExistsError } from "../../../../errors/already-exists.error";
import { hashValue, hashWithSha1, hashWithSha512 } from "../../../../../../../shared/crypto";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { createUserModel, getAlreadyExistsAttributes, UserModelGeneric } from "../models/user.model";
import { AttributeModel, AttributeModelGeneric } from "../models/attribute.model";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";
import * as RandExp from "randexp";
import { NotFoundError } from "../../../../errors/not-found.error";
import { SuperAdminConfig } from "../../../../config/config";
import { ConflictError } from "../../../../errors/conflict.error";
import { GetUsersCommandPayload } from "../commands/get-users.command";
import { GetUsersByResourceCommandPayload } from "../commands/get-users-by-resource.command";

export interface UserServiceProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
  passwordGenerator: RandExp;
  superAdminUser: SuperAdminConfig;
}

export interface UserResponse {
  id: string;
  username: string;
  isActive: boolean;
  activationToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  attributes: string[];
  isSuperAdmin: boolean;
}

export interface UsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export class UsersService {
  constructor(private dependencies: UserServiceProps) {}

  private async createUser(username: string, password: string, isOauth: boolean = false) {
    const { usersRepository, activationTokenUtils } = this.dependencies;

    const userWithSameUsername = await usersRepository.findByUsername(username);

    if (userWithSameUsername) {
      throw new AlreadyExistsError(`User with username ${username} already exists.`);
    }

    const hashedPasswordAndSalt = hashValue(password, hashWithSha512);
    const activationToken = activationTokenUtils.getActivationToken(username);
    const activationTokenExpireDate = activationTokenUtils.getActivationTokenExpireDate();
    const userModel = createUserModel({
      username,
      password: hashedPasswordAndSalt.hash,
      passwordSalt: hashedPasswordAndSalt.salt,
      isActive: isOauth || activationTokenUtils.shouldUserBeActive(),
      activationToken,
      activationTokenExpireDate,
      attributes: [],
    });
    return usersRepository.addUser(userModel);
  }

  public async createOauthUser(username: string) {
    const { passwordGenerator } = this.dependencies;
    const randomPassword = passwordGenerator.gen();

    return this.createUser(username, randomPassword, true);
  }

  public async createNormalUser(username: string, password: string) {
    return this.createUser(username, password);
  }

  public async userNameExists(username: string): Promise<boolean> {
    const { usersRepository } = this.dependencies;
    const user = await usersRepository.findByUsername(username);

    return !!user;
  }

  public async deleteUser(userId: string) {
    const { usersRepository, superAdminUser } = this.dependencies;

    const userToDelete = await usersRepository.findById(userId);

    if (!userToDelete) {
      throw new NotFoundError("Wrong user.");
    }

    if (userToDelete.username === superAdminUser.username) {
      throw new ConflictError("Cannot delete the system administrator account.");
    }

    await usersRepository.delete([userToDelete.id as string]);
  }

  public async addAttributes(user: UserModelGeneric, attributes: string[]) {
    const { usersRepository } = this.dependencies;
    const alreadyExistsAttributes = getAlreadyExistsAttributes(user, attributes);
    if (alreadyExistsAttributes && alreadyExistsAttributes.length) {
      throw new AlreadyExistsError(`User already has attributes: ${alreadyExistsAttributes.join(", ")}`);
    }
    const userAttributeNames = user.attributes.map((attribute) => attribute.name);
    const attributesToSave = attributes
      .filter((attribute) => !userAttributeNames.includes(attribute))
      .map((attribute) => AttributeModel.create({ name: attribute }));
    user.attributes.push(...attributesToSave);

    return usersRepository.save(user);
  }

  public generateResetPasswordToken(username: string) {
    const resetPasswordToken = hashValue(username, hashWithSha1);

    return resetPasswordToken.hash;
  }

  public async getUser(id: string, isSuperAdmin: boolean): Promise<UserResponse> {
    const { usersRepository } = this.dependencies;

    const userObject = await usersRepository.findById(id);

    if (!userObject) {
      throw new NotFoundError("User not found");
    }

    return {
      id: userObject.id as string,
      username: userObject.username,
      isActive: userObject.isActive,
      activationToken: userObject.activationToken ?? null,
      createdAt: userObject.createdAt as Date,
      updatedAt: userObject.updatedAt as Date,
      attributes: userObject.attributes ? userObject.attributes.map((attr: any) => attr.name) : [],
      isSuperAdmin,
    };
  }

  public async getUsers(queryPayload: GetUsersCommandPayload): Promise<UsersResponse> {
    const { usersRepository, superAdminUser } = this.dependencies;

    const usersObject = await usersRepository.getUsers(queryPayload);

    const { page, limit } = queryPayload;

    const result = {
      users: usersObject.users.map((user) => ({
        id: user.id,
        username: user.username,
        isActive: user.isActive,
        activationToken: user.activationToken ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        attributes: user.attributes.map((attribute) => attribute.name),
        isSuperAdmin:
          user.username === superAdminUser.username ||
          user.attributes.some((attribute) => superAdminUser.attributes.includes(attribute.name)),
      })),
      total: usersObject.total,
      page,
      limit,
    };

    // find the last page if users object is empty and request page is more than 1
    if (result.users.length === 0 && page > 1) {
      const lastPage = Math.ceil(result.total / (result.limit * result.page));
      const updateCommandPayload = { ...queryPayload, page: lastPage > 1 ? lastPage : 1 };
      return this.getUsers(updateCommandPayload);
    }

    return result as UsersResponse;
  }

  public async getUsersByResource(queryPayload: GetUsersByResourceCommandPayload): Promise<UsersResponse> {
    const { usersRepository, superAdminUser } = this.dependencies;

    const { page, limit, resourceName } = queryPayload;

    const usersObject: any = await usersRepository.getUsersByResourceName(page, limit, resourceName);

    return {
      users: usersObject.users.map((user: UserModelGeneric) => ({
        id: user.id,
        username: user.username,
        isActive: user.isActive,
        activationToken: user.activationToken ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        attributes: user.attributes.map((attribute: AttributeModelGeneric) => attribute.name),
        isSuperAdmin:
          user.username === superAdminUser.username ||
          user.attributes.some((attribute: AttributeModelGeneric) =>
            superAdminUser.attributes.includes(attribute.name),
          ),
      })),
      total: usersObject.total,
      page,
      limit,
    };
  }
}
