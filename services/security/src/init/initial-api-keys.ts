import { createQueryBuilder } from "typeorm";
import { AccessKeyModel } from "../app/features/tokens/models/access-key.model";

export class InitialApiKeys {
  public async update(apiKeys: string[]): Promise<any> {
    const keysToSave = apiKeys.map((apiKey) =>
      createQueryBuilder()
        .insert()
        .into(AccessKeyModel)
        .values({
          apiKey,
          type: "INITIAL",
          createdBy: "DEFAULT",
        })
        .onConflict("DO NOTHING")
        .execute(),
    );
    return Promise.all(keysToSave);
  }
}
