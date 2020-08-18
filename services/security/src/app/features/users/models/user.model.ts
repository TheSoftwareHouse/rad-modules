import { AttributeModel, AttributeModelGeneric } from "./attribute.model";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

export interface UserModelProps {
  username: string;
  password: string;
  passwordSalt: string;
  attributes: AttributeModelGeneric[];
  isActive: boolean;
  activationToken?: string | null;
  activationTokenExpireDate?: Date | null;
  deactivationDate?: Date | null;
  resetPasswordToken?: string | null;
}

export interface UserModelGeneric extends UserModelProps {
  id?: string;
  create?(data: Partial<UserModelProps>): UserModelGeneric;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity({
  name: "User",
})
export class UserModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  passwordSalt: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(
    // eslint-disable-next-line
    (type) => AttributeModel,
    (attribute) => attribute.user,
    { cascade: true, onUpdate: "CASCADE" },
  )
  attributes: AttributeModel[];

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true, type: "varchar" })
  activationToken?: string | null;

  @Column({ nullable: true, type: "timestamp" })
  activationTokenExpireDate?: Date | null;

  @Column({ nullable: true, type: "timestamp" })
  deactivationDate?: Date | null;

  @Column({ nullable: true, type: "varchar" })
  resetPasswordToken?: string | null;
}

export const createUserModel = (data: Partial<UserModelProps>) => {
  const entity = new UserModel();
  Object.assign(entity, data);
  return entity;
};
