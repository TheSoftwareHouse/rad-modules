import { PolicyModel, PolicyModelGeneric } from "../../app/features/policy/models/policy.model";
import { Repository, EntityRepository, In } from "typeorm";
import { PolicyRepository } from "../policy.repository";
import { createTypeORMFilter, QueryObject } from "../helpers/query-filter";
import { AlreadyExistsError } from "../../errors/already-exists.error";

@EntityRepository(PolicyModel)
export class PolicyTypeormRepository extends Repository<PolicyModel> implements PolicyRepository {
  public async addPolicy(policy: PolicyModelGeneric) {
    const policyThatAlreadyExist = await this.findBy({ attribute: policy.attribute, resource: policy.resource });

    if (policyThatAlreadyExist.length) {
      throw new AlreadyExistsError("Policy already exists.");
    }

    const policyModel = new PolicyModel();
    Object.assign(policyModel, policy);
    const newPolicy = await this.save(policyModel);

    return newPolicy as PolicyModelGeneric;
  }

  public async findBy(params: object) {
    return super.find({ where: params, order: { resource: "ASC", id: "DESC" } });
  }

  public async findByResourcesAndAttributes(resources: string[], attributes: string[]) {
    return super.find({
      where: {
        attribute: In([null, ...attributes]),
        resource: In([null, ...resources]),
      },
    });
  }

  public async delete(ids: string[]): Promise<any> {
    return super.delete(ids);
  }

  public async getNamesByAttributes(attributes: string[] = []): Promise<string[]> {
    return this.find({
      where: { attribute: In([null, ...attributes]) },
      select: ["resource"],
    }).then((result) => result.map(({ resource }) => resource));
  }

  public async getPolicies(queryObject: QueryObject) {
    const whereObject = createTypeORMFilter(queryObject, "policy.");
    const [policies, total] = await this.createQueryBuilder("policy")
      .where(whereObject.where, whereObject.operands)
      .skip((queryObject.page - 1) * queryObject.limit)
      .take(queryObject.limit)
      .orderBy(`policy.${queryObject.order.by}`, queryObject.order.type.toUpperCase())
      .cache(true)
      .getManyAndCount();
    return { policies, total };
  }
}
