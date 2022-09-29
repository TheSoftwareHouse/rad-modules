import { UserModelGeneric } from "../app/features/users/models/user.model";
import { QueryObject } from "./helpers/query-filter";

export interface UsersRepository {
  addUser: (user: UserModelGeneric) => Promise<UserModelGeneric>;
  findByUsername: (username: string) => Promise<UserModelGeneric | undefined>;
  findByActivationToken: (activationToken: string) => Promise<UserModelGeneric | undefined>;
  findById: (id: string) => Promise<UserModelGeneric | undefined>;
  findByIdWithoutAttributes: (id: string) => Promise<UserModelGeneric | undefined>;
  getAllUsersDisplayModel: () => Promise<UserModelGeneric[] | undefined[]>;
  getUsers: (queryObject: QueryObject) => Promise<{
    users: UserModelGeneric[];
    total: number;
  }>;
  getUserIdByUsername: (username: string) => Promise<string>;
  getUsersByResourceName: (
    page: number,
    limit: number,
    resourceName: string,
  ) => Promise<{
    users: UserModelGeneric[];
    total: number;
  }>;
  findUserByResetPasswordToken: (resetPasswordToken: string) => Promise<UserModelGeneric | undefined>;
  save: (user: UserModelGeneric) => Promise<UserModelGeneric>;
  delete: (ids: string[]) => Promise<any>;
}
