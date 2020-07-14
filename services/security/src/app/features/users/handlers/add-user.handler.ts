import { AlreadyExistsError } from "../../../../errors/already-exists.error";
import { hashValue, hashWithSha512 } from "../../../../../../../shared/crypto";
import { createUserModel } from "../models/user.model";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { Handler } from "../../../../../../../shared/command-bus";
import { ADD_USER_COMMAND_TYPE, AddUserCommand } from "../commands/add-user.command";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";
import { Mailer } from "../../../../utils/mailer/mailer";
import { Logger } from "winston";
import { UsersService } from "../services/users-service";

export interface AddUserHandlerProps {
  usersRepository: UsersRepository;
  usersService: UsersService;
  activationTokenUtils: ActivationTokenUtils;
  mailer: Mailer;
  logger: Logger;
}

export default class AddUserHandler implements Handler<AddUserCommand> {
  public commandType: string = ADD_USER_COMMAND_TYPE;

  constructor(private dependencies: AddUserHandlerProps) {}

  async execute(command: AddUserCommand) {
    const { usersRepository, usersService, activationTokenUtils, mailer, logger } = this.dependencies;
    const { username, password, attributes } = command.payload;
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
      isActive: activationTokenUtils.shouldUserBeActive(),
      activationToken,
      activationTokenExpireDate,
      attributes: [],
    });

    const newUser = await usersRepository.addUser(userModel);

    if (attributes?.length) {
      await usersService.addAttributes(newUser, attributes);
    }
    mailer
      .sendCreateUser(username, username, username)
      .catch((error) => logger.error(error instanceof Error ? error.message : "Unknown error while sending email"));
    return {
      newUserId: newUser.id,
    };
  }
}
