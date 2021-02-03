import { Command } from "@tshio/command-bus";
import { BearerToken } from "../../../../tokens/bearer-token";

export const HAS_ACCESS_COMMAND_TYPE = "users/HASACCESS";

export interface HasAccessCommandPayload {
  accessToken: BearerToken;
  resources: string[];
}

export class HasAccessCommand implements Command<HasAccessCommandPayload> {
  public type: string = HAS_ACCESS_COMMAND_TYPE;

  constructor(public payload: HasAccessCommandPayload) {}
}
