import { AccessKeyRepository } from "../../../../repositories/access-key.repostiory";
import { AccessKeyModel } from "../models/access-key.model";
import { CreateAccessKeyCommandPayload } from "../commands/create-access-key.command";
import { TokenType } from "../../../../tokens/jwt-payload";
import * as RandExp from "randexp";
import { BadRequestError } from "../../../../errors/bad-request.error";

export interface AccessKeyServiceProps {
  accessKeyRepository: AccessKeyRepository;
  apiKeyGenerator: RandExp;
}

export interface AccessKeyConfiguration extends CreateAccessKeyCommandPayload {}

export class AccessKeyService {
  constructor(private dependencies: AccessKeyServiceProps) {}

  public async createAccessKey(username: string) {
    const { accessKeyRepository, apiKeyGenerator } = this.dependencies;

    const apiKey = apiKeyGenerator.gen();
    const newAccessKey = await accessKeyRepository.addAccessKey(
      AccessKeyModel.create({
        apiKey,
        type: TokenType.CUSTOM,
        createdBy: username,
      }),
    );
    return newAccessKey;
  }

  public async getTokenConfiguration(apiKey: string) {
    const { accessKeyRepository } = this.dependencies;
    const newAccessKey = await accessKeyRepository.findByApiKey(apiKey);

    if (!newAccessKey) {
      throw new BadRequestError("Wrong Api Key.");
    }

    return {
      userId: newAccessKey.id,
      ...newAccessKey,
    };
  }

  public async deleteAccessKey(apiKey: string) {
    const { accessKeyRepository } = this.dependencies;

    const accessKeyToDelete = await accessKeyRepository.findByApiKey(apiKey);

    if (!accessKeyToDelete) {
      throw new BadRequestError("Wrong Api Key.");
    }

    await accessKeyRepository.delete([accessKeyToDelete.id]);
  }
}
