import { MigrationInterface, QueryRunner } from "typeorm";

export class removeAttributesOnUserDelete1576510223710 implements MigrationInterface {
  name = "removeAttributesOnUserDelete1576510223710";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "Attribute" DROP CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Attribute" ADD CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "Attribute" DROP CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Attribute" ADD CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}
