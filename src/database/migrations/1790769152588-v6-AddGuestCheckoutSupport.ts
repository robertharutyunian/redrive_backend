import { MigrationInterface, QueryRunner } from "typeorm";

export class V6AddGuestCheckoutSupport1790769152588 implements MigrationInterface {
    name = 'V6AddGuestCheckoutSupport1790769152588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "contact_name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "contact_email" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "contact_phone" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "emails" ADD "recipient_email" character varying(100)`);
        await queryRunner.query(`UPDATE "emails" SET "recipient_email" = "users"."email" FROM "users" WHERE "users"."id" = "emails"."user_id"`);
        await queryRunner.query(`ALTER TABLE "emails" ALTER COLUMN "recipient_email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emails" DROP COLUMN "recipient_email"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "contact_email"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "contact_name"`);
    }

}
