import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

interface NotificationModelProps {
  chanel: string;
  message: string;
}

@Entity({
  name: "Notification",
})
export class NotificationModel {
  public static create(data: Partial<NotificationModelProps>): NotificationModel {
    const entity = new NotificationModel();
    Object.assign(entity, data);

    return entity;
  }

  public static createMany(channels: string[], message: string): NotificationModel[] {
    const entities = channels.map((chanel) => {
      const entity = new NotificationModel();
      Object.assign(entity, { chanel, message });

      return entity;
    });

    return entities;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  chanel: string;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
