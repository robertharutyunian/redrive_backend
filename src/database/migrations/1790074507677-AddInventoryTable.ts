import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventoryTable1790074507677 implements MigrationInterface {
    name = 'AddInventoryTable1790074507677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "origin_price" numeric(10,2) NOT NULL, "unit_price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tire_id" integer, CONSTRAINT "REL_ab9671e01398244fd09c8b85b9" UNIQUE ("tire_id"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_ab9671e01398244fd09c8b85b91" FOREIGN KEY ("tire_id") REFERENCES "tires"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_ab9671e01398244fd09c8b85b91"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
    }

}
