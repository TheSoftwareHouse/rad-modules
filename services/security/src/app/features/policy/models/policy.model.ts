import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

interface PolicyModelProps {
  attribute: string;
  resource: string;
}

export interface PolicyModelGeneric {
  id?: string;
  attribute: string;
  resource: string;
}

@Entity({
  name: "Policy",
})
@Index("index_item_sequence", ["resource", "attribute"], { unique: true })
export class PolicyModel {
  public static create(data: Partial<PolicyModelProps>): PolicyModel {
    const entity = new PolicyModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  attribute: string;

  @Column()
  resource: string;
}
