import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

interface AccessKeyModelProps {
  apiKey: string;
  type: string;
  createdBy: string;
  createdAt: Date;
}

@Entity({
  name: "AccessKey",
})
@Index("api_key_item_sequence", ["apiKey"], { unique: true })
export class AccessKeyModel {
  public static create(data: Partial<AccessKeyModelProps>): AccessKeyModel {
    const entity = new AccessKeyModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  apiKey: string;

  @Column()
  type: string;

  @Column()
  createdBy: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
