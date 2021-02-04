import { CommandHandler } from "@tshio/command-bus";
import { REMOVE_ACCESS_KEY_COMMAND_TYPE, RemoveAccessKeyCommand } from "../commands/remove-access-key.command";
import { AccessKeyService } from "../services/access-key-service";
import { CreateAccessKeyProps } from "./create-access-key.handler";

export interface RemoveAccessKeyProps {
  accessKeyService: AccessKeyService;
}

export default class RemoveAccessKeyHandler implements CommandHandler<RemoveAccessKeyCommand> {
  public commandType: string = REMOVE_ACCESS_KEY_COMMAND_TYPE;

  constructor(private dependencies: CreateAccessKeyProps) {}

  async execute(command: RemoveAccessKeyCommand) {
    // execute body
    return this.dependencies.accessKeyService.deleteAccessKey(command.payload.apiKey);
  }
}
