import { Repository, EntityRepository } from "typeorm";
import { AccessKeyModel } from "../../app/features/tokens/models/access-key.model";
import { AccessKeyRepository } from "../access-key.repostiory";

@EntityRepository(AccessKeyModel)
export class AccessKeyTypeormRepository extends Repository<AccessKeyModel> implements AccessKeyRepository {
  public async addAccessKey(accessKey: AccessKeyModel) {
    const newAccessKey = await this.save(accessKey);

    return newAccessKey;
  }

  public async findByApiKey(apiKey: string) {
    const accessKey = await this.findOne({ where: { apiKey } });

    return accessKey;
  }

  public async findById(id: string) {
    const accessKey = await this.findOne({ where: { id } });

    return accessKey;
  }

  public delete(ids: string[]) {
    return super.delete(ids);
  }

  public async getAllAccessKeysDisplayModel(page: number, limit: number) {
    const accessKeys = await this.find({ skip: page * limit, take: limit });

    return accessKeys;
  }

  public async getAccessKeys(page: number, limit: number) {
    const [accessKeys, total] = await this.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { accessKeys, total };
  }
}
