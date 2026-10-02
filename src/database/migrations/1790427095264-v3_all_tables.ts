import { MigrationInterface, QueryRunner } from "typeorm";

export class V3AllTables1790427095264 implements MigrationInterface {
    name = 'V3AllTables1790427095264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "fname" character varying NOT NULL, "lname" character varying NOT NULL, "phone" character varying, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_delivery_method_enum" AS ENUM('pickup', 'courier')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'processing', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "delivery_method" "public"."orders_delivery_method_enum" NOT NULL, "delivery_address" character varying NOT NULL, "delivery_instructions" character varying, "status" "public"."orders_status_enum" NOT NULL, "total_price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a922b820eeef29ac1c6800e826" ON "orders"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders"  ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('card', 'cash')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'succeeded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "method" "public"."payment_method_enum" NOT NULL, "status" "public"."payment_status_enum" NOT NULL, "gateway" character varying, "gateway_reference" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" integer, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f5221735ace059250daac9d980" ON "payment"  ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3af0086da18f32ac05a52e5639" ON "payment"  ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_92279c2166bc2b606b305924c3" ON "payment"  ("gateway_reference") `);
        await queryRunner.query(`CREATE TYPE "public"."lg_payment_event_type_enum" AS ENUM('initiated', 'gateway_callback', 'status_changed', 'error')`);
        await queryRunner.query(`CREATE TYPE "public"."lg_payment_previous_status_enum" AS ENUM('pending', 'succeeded', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."lg_payment_new_status_enum" AS ENUM('pending', 'succeeded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "lg_payment" ("id" SERIAL NOT NULL, "event_type" "public"."lg_payment_event_type_enum" NOT NULL, "previous_status" "public"."lg_payment_previous_status_enum", "new_status" "public"."lg_payment_new_status_enum", "message" character varying, "raw_payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "payment_id" integer, CONSTRAINT "PK_b5ac0c4b31c3f9f7cc717e9b00c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_173db745c8fb516476d088a617" ON "lg_payment"  ("payment_id") `);
        await queryRunner.query(`CREATE TYPE "public"."refund_status_enum" AS ENUM('requested', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "refund" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "reason" character varying, "status" "public"."refund_status_enum" NOT NULL, "gateway_reference" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "payment_id" integer, CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e116348330845195dc5b1585f" ON "refund"  ("payment_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_087d10162fa7d3d434424deb31" ON "refund"  ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ed7809ba51b40ac0844fb0bba6" ON "refund"  ("gateway_reference") `);
        await queryRunner.query(`CREATE TYPE "public"."lg_refund_event_type_enum" AS ENUM('requested', 'gateway_callback', 'status_changed', 'error')`);
        await queryRunner.query(`CREATE TYPE "public"."lg_refund_previous_status_enum" AS ENUM('requested', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."lg_refund_new_status_enum" AS ENUM('requested', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "lg_refund" ("id" SERIAL NOT NULL, "event_type" "public"."lg_refund_event_type_enum" NOT NULL, "previous_status" "public"."lg_refund_previous_status_enum", "new_status" "public"."lg_refund_new_status_enum", "message" character varying, "raw_payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "refund_id" integer, CONSTRAINT "PK_ed1a18d70ab75102e8660a523ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8d96e38018a40d956df4c9c0f6" ON "lg_refund"  ("refund_id") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total_price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" integer, "tire_id" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_145532db85752b29c57d2b7b1f" ON "order_items"  ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_78ec3e27e06755d899891b5f66" ON "order_items"  ("tire_id") `);
        await queryRunner.query(`CREATE TYPE "public"."emails_type_enum" AS ENUM('order_confirmation', 'invoice', 'password_reset', 'shipping_update')`);
        await queryRunner.query(`CREATE TABLE "emails" ("id" SERIAL NOT NULL, "type" "public"."emails_type_enum" NOT NULL, "sent_at" TIMESTAMP, "invoice_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "order_id" integer, CONSTRAINT "PK_a54dcebef8d05dca7e839749571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4c1f50332557b4c0adb2c6cac4" ON "emails"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1020fa553f2e2270f265cd9987" ON "emails"  ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f1b72dc4aadb44a01bbece3a6" ON "tires"  ("brand_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfc59caedeedb84947b409a724" ON "tires"  ("width", "profile", "radius") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_f5221735ace059250daac9d9803" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lg_payment" ADD CONSTRAINT "FK_173db745c8fb516476d088a617d" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_8e116348330845195dc5b1585fc" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lg_refund" ADD CONSTRAINT "FK_8d96e38018a40d956df4c9c0f6b" FOREIGN KEY ("refund_id") REFERENCES "refund"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_78ec3e27e06755d899891b5f66d" FOREIGN KEY ("tire_id") REFERENCES "tires"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emails" ADD CONSTRAINT "FK_4c1f50332557b4c0adb2c6cac41" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emails" ADD CONSTRAINT "FK_1020fa553f2e2270f265cd9987a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emails" DROP CONSTRAINT "FK_1020fa553f2e2270f265cd9987a"`);
        await queryRunner.query(`ALTER TABLE "emails" DROP CONSTRAINT "FK_4c1f50332557b4c0adb2c6cac41"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_78ec3e27e06755d899891b5f66d"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "lg_refund" DROP CONSTRAINT "FK_8d96e38018a40d956df4c9c0f6b"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_8e116348330845195dc5b1585fc"`);
        await queryRunner.query(`ALTER TABLE "lg_payment" DROP CONSTRAINT "FK_173db745c8fb516476d088a617d"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_f5221735ace059250daac9d9803"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfc59caedeedb84947b409a724"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f1b72dc4aadb44a01bbece3a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1020fa553f2e2270f265cd9987"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c1f50332557b4c0adb2c6cac4"`);
        await queryRunner.query(`DROP TABLE "emails"`);
        await queryRunner.query(`DROP TYPE "public"."emails_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78ec3e27e06755d899891b5f66"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_145532db85752b29c57d2b7b1f"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d96e38018a40d956df4c9c0f6"`);
        await queryRunner.query(`DROP TABLE "lg_refund"`);
        await queryRunner.query(`DROP TYPE "public"."lg_refund_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lg_refund_previous_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lg_refund_event_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed7809ba51b40ac0844fb0bba6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_087d10162fa7d3d434424deb31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e116348330845195dc5b1585f"`);
        await queryRunner.query(`DROP TABLE "refund"`);
        await queryRunner.query(`DROP TYPE "public"."refund_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_173db745c8fb516476d088a617"`);
        await queryRunner.query(`DROP TABLE "lg_payment"`);
        await queryRunner.query(`DROP TYPE "public"."lg_payment_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lg_payment_previous_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lg_payment_event_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92279c2166bc2b606b305924c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3af0086da18f32ac05a52e5639"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5221735ace059250daac9d980"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a922b820eeef29ac1c6800e826"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_delivery_method_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
