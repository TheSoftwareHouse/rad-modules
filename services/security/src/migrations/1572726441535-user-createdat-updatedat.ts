import { MigrationInterface, QueryRunner } from "typeorm";

export class userCreatedatUpdatedat1572726441535 implements MigrationInterface {
  name = "userCreatedatUpdatedat1572726441535";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
    await queryRunner.query(`ALTER TABLE "User" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "updatedAt"`, undefined);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "createdAt"`, undefined);
  }
}
