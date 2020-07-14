import { TokensRepository } from "./tokens.repository";
import { RedisRepository } from "./redis.repository";

type TokensRedisRepositoryProps = {
  redisRepository: RedisRepository;
};

export class TokensRedisRepository implements TokensRepository {
  constructor(private dependencies: TokensRedisRepositoryProps) {}

  public async addRefreshToken(userId: string, token: string) {
    this.dependencies.redisRepository.addToSet(userId, token);
  }

  public async belongsToUser(userId: string, token: string) {
    return (await this.dependencies.redisRepository.isMember(userId, token)) === 1;
  }

  public async removeRefreshToken(userId: string, token: string) {
    this.dependencies.redisRepository.removeFromSet(userId, token);
  }

  public async removeAllRefreshTokens(userId: string) {
    this.dependencies.redisRepository.removeSet(userId);
  }
}
