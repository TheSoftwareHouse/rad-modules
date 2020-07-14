import { Handler } from "../../../../../../../shared/command-bus";
import { GENERATE_TOKEN_COMMAND_TYPE, GenerateTokenCommand } from "../commands/generate-token.command";
import { AccessKeyService } from "../services/access-key-service";
import { JwtUtils } from "../../../../tokens/jwt-utils";
import { v4 } from "uuid";
import { TokenType } from "../../../../tokens/jwt-payload";
import { PolicyService } from "../../policy/services/policy-service";

export interface GenerateTokenProps {
  accessKeyService: AccessKeyService;
  jwtUtils: JwtUtils;
  policyService: PolicyService;
}

export default class GenerateTokenHandler implements Handler<GenerateTokenCommand> {
  public commandType: string = GENERATE_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: GenerateTokenProps) {}

  async execute(command: GenerateTokenCommand) {
    // execute body
    const { accessKeyService, jwtUtils, policyService } = this.dependencies;
    const { apiKey, accessExpirationInSeconds, refreshExpirationInSeconds } = command.payload;
    const tokenConfiguration = await accessKeyService.getTokenConfiguration(apiKey);
    const attributes = policyService.getDefaultPoliciesAttributes();
    const policy = policyService.getDefaultPoliciesResources();

    const tokenPayload = {
      userId: tokenConfiguration.userId,
      username: v4(),
      attributes,
      policy,
      type: TokenType.CUSTOM,
      accessExpirationInSeconds,
      refreshExpirationInSeconds,
    };

    const { accessToken: accessTokenGenerated, refreshToken } = await jwtUtils.generateTokensAndHashedRefreshToken(
      tokenPayload,
    );

    return {
      accessToken: accessTokenGenerated,
      refreshToken,
    };
  }
}
