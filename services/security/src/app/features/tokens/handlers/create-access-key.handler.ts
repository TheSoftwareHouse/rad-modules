import { CommandHandler } from "@tshio/command-bus";
import { CREATE_ACCESS_KEY_COMMAND_TYPE, CreateAccessKeyCommand } from "../commands/create-access-key.command";
import { AccessKeyService } from "../services/access-key-service";
import { JwtUtils } from "../../../../tokens/jwt-utils";
import { TokenType } from "../../../../tokens/jwt-payload";
import { UnathorizedError } from "../../../../errors/unathorized.error";

export interface CreateAccessKeyProps {
  accessKeyService: AccessKeyService;
  jwtUtils: JwtUtils;
}
export default class CreateAccessKeyHandler implements CommandHandler<CreateAccessKeyCommand> {
  public commandType: string = CREATE_ACCESS_KEY_COMMAND_TYPE;

  constructor(private dependencies: CreateAccessKeyProps) {}

  async execute(command: CreateAccessKeyCommand) {
    // execute body
    const { accessKeyService, jwtUtils } = this.dependencies;
    const { username } = jwtUtils.tryToGetPayloadFromTokenOrThrow(command.payload.accessToken);

    if (!username) {
      throw new UnathorizedError("Undefined username");
    }

    const result = await accessKeyService.createAccessKey(username);

    return {
      apiKey: result.apiKey,
      type: TokenType.CUSTOM,
      createdBy: username,
    };
  }
}
