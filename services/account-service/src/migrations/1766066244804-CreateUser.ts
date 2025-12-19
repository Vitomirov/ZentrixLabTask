import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUser1766066244804 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "user",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
                { name: "username", type: "varchar", isUnique: true },
                { name: "password", type: "varchar" },
                { name: "role", type: "varchar", default: "'User'" }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }
}
