import { createQueryBuilder } from "typeorm";
import { PolicyModel } from "../app/features/policy/models/policy.model";

export interface InitialPolicyData {
  resource: string;
  attribute: string;
}

export class InitialPolicy {
  public async update(policiesData: InitialPolicyData[]): Promise<any> {
    const policiesToSave = policiesData.map((policy) =>
      createQueryBuilder().insert().into(PolicyModel).values(policy).onConflict("DO NOTHING").execute(),
    );
    return Promise.all(policiesToSave);
  }
}
