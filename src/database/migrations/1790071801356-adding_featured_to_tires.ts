import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingFeaturedToTires1790071801356 implements MigrationInterface {
    name = 'AddingFeaturedToTires1790071801356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tires" ADD "featured" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tires" DROP COLUMN "featured"`);
    }

}
