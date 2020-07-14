import { MigrationInterface, QueryRunner } from "typeorm";

export class userAddActivationTokenExpireDate1573720105677 implements MigrationInterface {
  name = "userAddActivationTokenExpireDate1573720105677";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "activationTokenExpireDate" TIMESTAMP`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "activationTokenExpireDate"`, undefined);
  }
}
