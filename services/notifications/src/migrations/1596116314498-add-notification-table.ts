import { MigrationInterface, QueryRunner } from "typeorm";

export class addNotificationTable1596116314498 implements MigrationInterface {
  name = "addNotificationTable1596116314498";

  public async up(queryRunner: QueryRunner): Promise<void> {
    "channel";
    await queryRunner.query(
      `CREATE TABLE "Notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" character varying NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da18f6446b6fea585f01d03f56c" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f6cca3c11a1d09d0532ade7c25" ON "Notification" ("channel") `, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_f6cca3c11a1d09d0532ade7c25"`, undefined);
    await queryRunner.query(`DROP TABLE "Notification"`, undefined);
  }
}
