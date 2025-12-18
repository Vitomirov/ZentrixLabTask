import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1766066244804 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "username" VARCHAR(50) NOT NULL UNIQUE,
                "password" VARCHAR(255) NOT NULL,
                "role" VARCHAR(20) NOT NULL DEFAULT 'User'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
