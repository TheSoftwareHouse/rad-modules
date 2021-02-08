import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { RedisRepository } from "../repositories/redis.repository";
import { TokensRedisRepository } from "../repositories/tokens.redis.repository";

export async function registerRedis(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    redisUrl: awilix.asValue(appConfig.redisUrl),
    redisPrefix: awilix.asValue(appConfig.redisPrefix),
    redisRepository: awilix.asClass(RedisRepository).singleton(),
    tokensRepository: awilix.asClass(TokensRedisRepository),
  });

  return container;
}
