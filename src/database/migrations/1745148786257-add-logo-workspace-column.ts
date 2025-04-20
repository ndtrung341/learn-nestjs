import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogoWorkspaceColumn1745148786257 implements MigrationInterface {
    name = 'AddLogoWorkspaceColumn1745148786257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace"
            ADD "logo" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace" DROP COLUMN "logo"
        `);
    }

}
