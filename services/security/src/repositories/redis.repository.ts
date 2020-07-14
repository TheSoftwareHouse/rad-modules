import { createClient } from "redis";
import { promisify } from "util";

type RedisRepositoryProps = {
  redisUrl: string;
  redisPrefix: string;
};

export class RedisRepository {
  public addToSet: (key: string, value: string) => Promise<unknown>;

  public removeFromSet: (key: string, value: string) => Promise<unknown>;

  public removeSet: (key: string) => Promise<unknown>;

  public isMember: (key: string, value: string) => Promise<number>;

  constructor(dependencies: RedisRepositoryProps) {
    const client = createClient({
      url: dependencies.redisUrl,
      prefix: dependencies.redisPrefix,
    });

    this.addToSet = promisify(client.sadd).bind(client);
    this.removeFromSet = promisify(client.srem).bind(client);
    this.removeSet = promisify(client.del).bind(client);
    this.isMember = promisify(client.sismember).bind(client);
  }
}
