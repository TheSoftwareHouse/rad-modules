import { BearerToken } from "../../../../tokens/bearer-token";
import { Command } from "../../../../../../../shared/command-bus";

export const HAS_ACCESS_COMMAND_TYPE = "users/HASACCESS";

export interface HasAccessCommandPayload {
  accessToken: BearerToken;
  resource: string;
}

export class HasAccessCommand implements Command<HasAccessCommandPayload> {
  public type: string = HAS_ACCESS_COMMAND_TYPE;

  constructor(public payload: HasAccessCommandPayload) {}
}
