import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetTokenToUsers1790600705178 implements MigrationInterface {
    name = 'AddPasswordResetTokenToUsers1790600705178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_hash" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_expires_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_hash"`);
    }

}
