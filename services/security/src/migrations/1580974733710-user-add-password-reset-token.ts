import { MigrationInterface, QueryRunner } from "typeorm";

export class userAddPasswordResetToken1580974733710 implements MigrationInterface {
  name = "userAddPasswordResetToken1580974733710";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" ADD "resetPasswordToken" character varying`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "resetPasswordToken"`, undefined);
  }
}
