import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

type jsonB = { [key: string]: any };

export enum JobStatus {
  New = "new",
  Active = "active",
  Completed = "completed",
  Failed = "failed",
  Paused = "paused",
  Deleted = "deleted",
}

export interface jobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  cron?: string;
  cronStartDate?: string;
  cronEndDate?: string;
  cronTimeZone?: string;
  cronLimit?: number;
  backoff?: number;
  lifo?: boolean;
  timeout?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  stackTraceLimit?: number;
}

interface JobModelProps {
  id: string;
  name: string;
  service: string;
  action: string;
  cron?: string;
  status: JobStatus;
  jobOptions?: jobOptions;
  payload?: jsonB;
}

@Entity({
  name: "Job",
})
export class JobModel {
  public static create(data: Partial<JobModelProps>): JobModel {
    const entity = new JobModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Unique("Duplicate name", ["name"])
  @Column()
  name: string;

  @Column()
  service: string;

  @Column()
  action: string;

  @Column("enum", { enum: JobStatus, nullable: false, default: JobStatus.New })
  status: JobStatus;

  @Column({ type: "jsonb", nullable: true })
  jobOptions?: jobOptions;

  @Column({ type: "jsonb", nullable: true })
  payload?: jsonB;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
