import { MigrationInterface, QueryRunner } from "typeorm";

export class userAddActivationToken1573559827439 implements MigrationInterface {
  name = "userAddActivationToken1573559827439";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "activationToken" character varying`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "activationToken"`, undefined);
  }
}
