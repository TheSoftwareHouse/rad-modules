import { createClient, RedisClient } from "redis";
import { promisify } from "util";

type EmailQueueConfig = {
  redisUrl: string;
  redisPrefix: string;
  queueName: string;
};

export enum EmailQueuePriority {
  URGENT = "urgent",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export class EmailQueue {
  constructor(config: EmailQueueConfig) {
    this.client = createClient({
      url: config.redisUrl,
      prefix: config.redisPrefix,
    });

    this.queueName = config.queueName;
  }

  private readonly queueName: string;

  private readonly client: RedisClient;

  public async add(items: any[]) {
    const lpush = promisify(this.client.lpush).bind(this.client) as any;
    const itemsString = items.map((item) => JSON.stringify(item));
    return lpush(this.queueName, itemsString);
  }

  public async get(count = 1) {
    const lrange = promisify(this.client.lrange).bind(this.client);
    const ltrim = promisify(this.client.ltrim).bind(this.client);

    const result = (await lrange(this.queueName, count * -1, -1)).map((item) => JSON.parse(item));

    await ltrim(this.queueName, 0, (result.length + 1) * -1);

    return result;
  }
}
