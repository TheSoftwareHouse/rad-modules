import { Repository, EntityRepository, In } from "typeorm";
import { createTypeORMFilter, QueryObject } from "../helpers/query-filter";
import { AttributeModel } from "../../app/features/users/models/attribute.model";
import { AttributesRepository } from "../attributes.repostiory";
import { UserModelGeneric } from "../../app/features/users/models/user.model";

@EntityRepository(AttributeModel)
export class AttributesTypeormRepository extends Repository<AttributeModel> implements AttributesRepository {
  public async getAttributes(queryObject: QueryObject) {
    const whereObject = createTypeORMFilter(queryObject, "attribute.");
    const [attributes, total] = await this.createQueryBuilder("attribute")
      .leftJoinAndSelect("attribute.user", "user")
      .where(whereObject.where, whereObject.operands)
      .skip((queryObject.page - 1) * queryObject.limit)
      .take(queryObject.limit)
      .orderBy(
        queryObject.order.by.indexOf(".") > -1 ? queryObject.order.by : `attribute.${queryObject.order.by}`,
        queryObject.order.type.toUpperCase(),
      )
      .cache(true)
      .getManyAndCount();
    return { attributes, total };
  }

  public delete(ids: string[]) {
    return super.delete(ids);
  }

  public async doesUserAlreadyHaveAttributes({ user, attributes }: { user: UserModelGeneric; attributes: string[] }) {
    const attributesFound = await this.find({
      where: {
        user,
        name: In(attributes),
      },
    });
    return attributesFound.map(({ name }) => name);
  }
}
