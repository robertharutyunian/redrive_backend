import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserPhoneRequired1790610905655 implements MigrationInterface {
    name = 'MakeUserPhoneRequired1790610905655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
    }

}
