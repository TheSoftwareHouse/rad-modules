import { Command } from "@tshio/command-bus";

export const CREATE_ACCESS_KEY_COMMAND_TYPE = "admin/CREATEACCESSKEY";

export interface CreateAccessKeyCommandPayload {
  accessToken: string;
}

export class CreateAccessKeyCommand implements Command<CreateAccessKeyCommandPayload> {
  public type: string = CREATE_ACCESS_KEY_COMMAND_TYPE;

  constructor(public payload: CreateAccessKeyCommandPayload) {}
}
