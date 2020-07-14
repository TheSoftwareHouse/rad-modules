import { UserModel, UserModelGeneric } from "./user.model";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

interface AttributeModelProps {
  name: string;
  user: UserModel;
}

export interface AttributeModelGeneric {
  create?(data: Partial<AttributeModelProps>): AttributeModelGeneric;
  id?: string;
  name: string;
  user: UserModelGeneric;
}

@Entity({
  name: "Attribute",
})
export class AttributeModel {
  public static create(data: Partial<AttributeModelProps>): AttributeModelGeneric {
    const entity = new AttributeModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(
    // eslint-disable-next-line
    (type) => UserModel,
    (user) => user.attributes,
    { onDelete: "CASCADE" },
  )
  user: UserModelGeneric;
}
