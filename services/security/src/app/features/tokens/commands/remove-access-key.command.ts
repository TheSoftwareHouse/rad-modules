import { Command } from "@tshio/command-bus";

export const REMOVE_ACCESS_KEY_COMMAND_TYPE = "tokens/REMOVEACCESSKEY";

export interface RemoveAccessKeyCommandPayload {
  apiKey: string;
}

export class RemoveAccessKeyCommand implements Command<RemoveAccessKeyCommandPayload> {
  public type: string = REMOVE_ACCESS_KEY_COMMAND_TYPE;

  constructor(public payload: RemoveAccessKeyCommandPayload) {}
}
