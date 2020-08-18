import { UserModel, UserModelGeneric } from "../../app/features/users/models/user.model";
import { UsersRepository } from "../users.repostiory";
import { EntityRepository, Repository } from "typeorm";
import { createTypeORMFilter, QueryObject } from "../helpers/query-filter";

@EntityRepository(UserModel)
export class UsersTypeormRepository extends Repository<UserModel> implements UsersRepository {
  public async addUser(user: UserModelGeneric) {
    return this.save(user);
  }

  public async findByUsername(username: string) {
    return this.findOne({ where: { username }, relations: ["attributes"] });
  }

  public async findById(id: string) {
    return this.findOne({ where: { id }, relations: ["attributes"] });
  }

  public async findByIdWithoutAttributes(id: string) {
    return this.findOne({ where: { id } });
  }

  public findByActivationToken(activationToken: string) {
    return this.findOne({ where: { activationToken }, relations: ["attributes"] });
  }

  public getAllUsersDisplayModel() {
    return this.find({ select: ["id", "username", "createdAt", "updatedAt", "isActive", "activationToken"] });
  }

  public async getUsers(queryObject: QueryObject) {
    const whereObject = createTypeORMFilter(queryObject, "user.");
    const [users, total] = await this.createQueryBuilder("user")
      .leftJoinAndSelect("user.attributes", "attribute")
      .where(whereObject.where, whereObject.operands)
      .skip((queryObject.page - 1) * queryObject.limit)
      .take(queryObject.limit)
      .orderBy(`user.${queryObject.order.by}`, queryObject.order.type.toUpperCase())
      .cache(true)
      .getManyAndCount();
    return { users, total };
  }

  public async getUsersByResourceName(page: number, limit: number, resourceName: string) {
    const [users, total] = await this.createQueryBuilder("user")
      .leftJoinAndMapMany("user.attributes", "Attribute", "attribute", `user.id = attribute."userId"`) // eslint-disable-line
      .leftJoin("Policy", "policy", "policy.attribute = attribute.name")
      .where("policy.resource = :resourceName", { resourceName })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { users, total };
  }

  public async getUserIdByUsername(username: string) {
    const user = await this.findOne({ where: { username }, select: ["id"] });

    return user ? user.id : "";
  }

  public async findUserByResetPasswordToken(resetPasswordToken: string) {
    return this.findOne({ where: { resetPasswordToken } });
  }

  public delete(ids: string[]) {
    return super.delete(ids);
  }
}
