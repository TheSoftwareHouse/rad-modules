import { Command } from "@tshio/command-bus";

export const GET_ACCESS_KEYS_COMMAND_TYPE = "tokens/GETACCESSKEYS";

export interface GetAccessKeysCommandPayload {
  page: number;
  limit: number;
}

export class GetAccessKeysCommand implements Command<GetAccessKeysCommandPayload> {
  public type: string = GET_ACCESS_KEYS_COMMAND_TYPE;

  constructor(public payload: GetAccessKeysCommandPayload) {}
}
