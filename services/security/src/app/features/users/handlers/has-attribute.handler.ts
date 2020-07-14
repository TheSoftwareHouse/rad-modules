import { TokenConfig } from "../../../../config/config";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { Handler } from "../../../../../../../shared/command-bus";
import { HAS_ATTRIBUTE_COMMAND_TYPE, HasAttributeCommand } from "../commands/has-attribute.command";
import { UnathorizedError } from "../../../../errors/unathorized.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { JwtUtils } from "../../../../tokens/jwt-utils";
import { TokenType } from "../../../../tokens/jwt-payload";
import { AuthorizationClient } from "../../../../ACL/authorization-client.types";
import { UserModelGeneric } from "../models/user.model";

export interface AddAttributeHandlerProps {
  usersRepository: UsersRepository;
  accessTokenConfig: TokenConfig;
  jwtUtils: JwtUtils;
  authorizationClient: AuthorizationClient;
}

export default class HasAttributeHandler implements Handler<HasAttributeCommand> {
  public commandType: string = HAS_ATTRIBUTE_COMMAND_TYPE;

  constructor(private dependencies: AddAttributeHandlerProps) {}

  async execute(command: HasAttributeCommand) {
    const { accessToken, attributes } = command.payload;

    if (!accessToken) {
      throw new UnathorizedError("Access token not provided.");
    }

    const {
      userId,
      type,
      attributes: tokenAttributes = [],
    } = this.dependencies.jwtUtils.tryToGetPayloadFromTokenOrThrow(accessToken.getToken());
    const { usersRepository } = this.dependencies;

    if (type === TokenType.CUSTOM) {
      const ownedAttributes = attributes.filter((attribute) => tokenAttributes.includes(attribute));
      return {
        hasAllAttributes: ownedAttributes.length === attributes.length,
        ownedAttributes,
      };
    }

    const user = (await usersRepository.findById(userId)) as UserModelGeneric;

    if (!user) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    const attributesIntersection = user?.getAlreadyExists ? user.getAlreadyExists(attributes) : [];
    const hasAllAttributes = await this.dependencies.authorizationClient.hasAttributes(
      accessToken.getToken(),
      attributes,
    );

    return {
      hasAllAttributes,
      ownedAttributes: attributesIntersection,
    };
  }
}
