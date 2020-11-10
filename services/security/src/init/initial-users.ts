import { UsersRepository } from "../repositories/users.repostiory";
import { hashValue, hashWithSha512 } from "../../../../shared/crypto";
// import { createUserModel } from "../app/features/users/models/user.model";
import { Connection, EntityManager } from "typeorm";
// import { AttributeModel } from "../app/features/users/models/attribute.model";
import * as RandExp from "randexp";
import { ActivationTokenUtils } from "../tokens/activation-token-utils";

export interface InitialUserData {
  username: string;
  password?: string;
  attributes: string[];
  isActive?: boolean;
}

export interface InitialUsersProperties {
  entityManager?: EntityManager;
  dbConnection?: Connection;
  usersRepository: UsersRepository;
  passwordGenerator: RandExp;
  userPasswordIsRandom: boolean;
  activationTokenUtils: ActivationTokenUtils;
}

export class InitialUsers {
  constructor(private properties: InitialUsersProperties) {}

  public async update(_usersData: InitialUserData[]): Promise<void> {
    // const { usersRepository, activationTokenUtils } = this.properties;
    //
    // const usersToSave = usersData.map(async (userData) => {
    //   const hashedPasswordAndSalt = this.getHashedPasswordAndSalt(userData);
    //   const user = await usersRepository.findByUsername(userData.username);
    //
    //   if (user) {
    //     if (hashedPasswordAndSalt) {
    //       user.password = hashedPasswordAndSalt.hash;
    //       user.passwordSalt = hashedPasswordAndSalt.salt;
    //     }
    //     const userAttributesNames = user.attributes.map((attribute) => attribute.name);
    //
    //     userData.attributes
    //       .filter((attribute) => !userAttributesNames.includes(attribute))
    //       .forEach((attribute) => user.attributes.push(AttributeModel.create({ name: attribute })));
    //
    //     return user;
    //   }
    //
    //   if (!hashedPasswordAndSalt) {
    //     return Promise.reject(new Error(`Password cannot be empty to create a new user '${userData.username}'`));
    //   }
    //
    //   const attributes = userData.attributes.map((attribute) => AttributeModel.create({ name: attribute }));
    //
    //   return createUserModel({
    //     username: userData.username,
    //     password: hashedPasswordAndSalt.hash,
    //     passwordSalt: hashedPasswordAndSalt.salt,
    //     attributes,
    //     isActive: userData.isActive ?? true,
    //     activationToken:
    //       userData.isActive === true ? activationTokenUtils.getActivationToken(userData.username, true) : null,
    //     activationTokenExpireDate:
    //       userData.isActive === true ? activationTokenUtils.getActivationTokenExpireDate(true) : null,
    //   });
    // });
    // const resolvedUsers = await Promise.all(usersToSave);
    // TODO
    // return entityManager.transaction(async (transactionalEntityManager) => {
    //   await transactionalEntityManager.save(resolvedUsers);
    // });
  }

  private getHashedPasswordAndSalt(userData: InitialUserData) {
    const { userPasswordIsRandom, passwordGenerator } = this.properties;

    if (userPasswordIsRandom) {
      return hashValue(passwordGenerator.gen(), hashWithSha512);
    }

    return typeof userData.password === "string" && userData.password.length > 0
      ? hashValue(userData.password, hashWithSha512)
      : undefined;
  }
}
