import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1790019126839 implements MigrationInterface {
    name = 'InitSchema1790019126839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tires_season_enum" AS ENUM('summer', 'winter', 'all_season')`);
        await queryRunner.query(`CREATE TABLE "tires" ("id" SERIAL NOT NULL, "model" character varying NOT NULL, "season" "public"."tires_season_enum" NOT NULL, "width" integer NOT NULL, "profile" integer NOT NULL, "radius" integer NOT NULL, "load_index" integer NOT NULL, "speed_rating" character varying NOT NULL, "extra_load" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "brand_id" integer, CONSTRAINT "PK_d0486c80db39eb9becdfec74546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "logo_url" character varying, "country" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tires" ADD CONSTRAINT "FK_2f1b72dc4aadb44a01bbece3a6e" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tires" DROP CONSTRAINT "FK_2f1b72dc4aadb44a01bbece3a6e"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "tires"`);
        await queryRunner.query(`DROP TYPE "public"."tires_season_enum"`);
    }

}
