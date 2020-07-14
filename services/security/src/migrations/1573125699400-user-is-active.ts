import { MigrationInterface, QueryRunner } from "typeorm";

export class userIsActive1573125699400 implements MigrationInterface {
  name = "userIsActive1573125699400";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "isActive" boolean NOT NULL DEFAULT false`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "isActive"`, undefined);
  }
}
