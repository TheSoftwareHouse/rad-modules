import { AccessKeyModel } from "../app/features/tokens/models/access-key.model";

export interface AccessKeyRepository {
  addAccessKey: (accessKey: AccessKeyModel) => Promise<AccessKeyModel>;
  findByApiKey: (username: string) => Promise<AccessKeyModel | undefined>;
  findById: (id: string) => Promise<AccessKeyModel | undefined>;
  save: (accessKey: AccessKeyModel) => Promise<AccessKeyModel>;
  delete: (ids: string[]) => Promise<any>;
  getAllAccessKeysDisplayModel: (page: number, limit: number) => Promise<AccessKeyModel[]>;
  getAccessKeys: (
    page: number,
    limit: number,
  ) => Promise<{
    accessKeys: AccessKeyModel[];
    total: number;
  }>;
}
