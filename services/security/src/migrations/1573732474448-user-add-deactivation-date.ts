import { MigrationInterface, QueryRunner } from "typeorm";

export class userAddDeactivationDate1573732474448 implements MigrationInterface {
  name = "userAddDeactivationDate1573732474448";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "deactivationDate" TIMESTAMP`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "deactivationDate"`, undefined);
  }
}
