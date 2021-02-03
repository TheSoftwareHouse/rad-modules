import { CommandHandler } from "@tshio/command-bus";
import { GET_ACCESS_KEYS_COMMAND_TYPE, GetAccessKeysCommand } from "../commands/get-access-keys.command";
import { AccessKeyRepository } from "../../../../repositories/access-key.repostiory";

export interface GetAccessKeysHandlerProps {
  accessKeyRepository: AccessKeyRepository;
}

export default class GetAccessKeysHandler implements CommandHandler<GetAccessKeysCommand> {
  public commandType: string = GET_ACCESS_KEYS_COMMAND_TYPE;

  constructor(private dependencies: GetAccessKeysHandlerProps) {}

  async execute(command: GetAccessKeysCommand) {
    const { accessKeyRepository } = this.dependencies;
    const { page, limit } = command.payload;
    const accessKeysObject = await accessKeyRepository.getAccessKeys(page, limit);

    return accessKeysObject;
  }
}
