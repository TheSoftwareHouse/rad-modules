import { Command } from "../../../../../../../shared/command-bus";

export const GENERATE_TOKEN_COMMAND_TYPE = "tokens/GENERATETOKEN";

export interface GenerateTokenCommandPayload {
  apiKey: string;
  accessExpirationInSeconds: number;
  refreshExpirationInSeconds: number;
}

export class GenerateTokenCommand implements Command<GenerateTokenCommandPayload> {
  public type: string = GENERATE_TOKEN_COMMAND_TYPE;

  constructor(public payload: GenerateTokenCommandPayload) {}
}
