import { Command } from "../../../../../../../shared/command-bus";

export const ME_COMMAND_TYPE = "public/ME";

export interface MeCommandPayload {
  accessToken: string;
}

export class MeCommand implements Command<MeCommandPayload> {
  public type: string = ME_COMMAND_TYPE;

  constructor(public payload: MeCommandPayload) {}
}
