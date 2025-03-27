import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkspaceAndMemberTable1743046780111 implements MigrationInterface {
    name = 'CreateWorkspaceAndMemberTable1743046780111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."workspaces_visibility_enum" AS ENUM('public', 'private')
        `);
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying NOT NULL DEFAULT '',
                "slug" character varying NOT NULL,
                "visibility" "public"."workspaces_visibility_enum" NOT NULL DEFAULT 'private',
                CONSTRAINT "UQ_b8e9fe62e93d60089dfc4f175f3" UNIQUE ("slug"),
                CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b8e9fe62e93d60089dfc4f175f" ON "workspaces" ("slug")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."workspace_members_role_enum" AS ENUM('admin', 'normal')
        `);
        await queryRunner.query(`
            CREATE TABLE "workspace_members" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "workspace_id" uuid NOT NULL,
                "role" "public"."workspace_members_role_enum" NOT NULL DEFAULT 'normal',
                CONSTRAINT "UQ_4896b609c71ca5ad20ad662077b" UNIQUE ("user_id", "workspace_id"),
                CONSTRAINT "PK_22ab43ac5865cd62769121d2bc4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4e83431119fa585fc7aa8b817d" ON "workspace_members" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4a7c584ddfe855379598b5e20f" ON "workspace_members" ("workspace_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_members"
            ADD CONSTRAINT "FK_4e83431119fa585fc7aa8b817db" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_members"
            ADD CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4e83431119fa585fc7aa8b817db"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4a7c584ddfe855379598b5e20f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4e83431119fa585fc7aa8b817d"
        `);
        await queryRunner.query(`
            DROP TABLE "workspace_members"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspace_members_role_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b8e9fe62e93d60089dfc4f175f"
        `);
        await queryRunner.query(`
            DROP TABLE "workspaces"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspaces_visibility_enum"
        `);
    }

}
