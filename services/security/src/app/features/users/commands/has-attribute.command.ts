import { BearerToken } from "../../../../tokens/bearer-token";
import { Command } from "../../../../../../../shared/command-bus";

export const HAS_ATTRIBUTE_COMMAND_TYPE = "users/HASATTRIBUTE";

export interface HasAttributeCommandPayload {
  accessToken: BearerToken;
  attributes: string[];
}

export class HasAttributeCommand implements Command<HasAttributeCommandPayload> {
  public type: string = HAS_ATTRIBUTE_COMMAND_TYPE;

  constructor(public payload: HasAttributeCommandPayload) {}
}
