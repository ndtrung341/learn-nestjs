import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkspaceAndMemberTable1743247000004 implements MigrationInterface {
    name = 'CreateWorkspaceAndMemberTable1743247000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "workspace" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying DEFAULT '',
                "slug" character varying NOT NULL,
                "visibility" "public"."workspace_visibility_enum" NOT NULL DEFAULT 'private',
                CONSTRAINT "UQ_workspace_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_workspace" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "workspace_member" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "workspace_id" uuid NOT NULL,
                "role" "public"."workspace_member_role_enum" NOT NULL DEFAULT 'normal',
                CONSTRAINT "UQ_workspace_member" UNIQUE ("user_id", "workspace_id"),
                CONSTRAINT "PK_workspace_member" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member"
            ADD CONSTRAINT "FK_workspace_member_user_id_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member"
            ADD CONSTRAINT "FK_workspace_member_workspace_id_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_workspace_id_workspace"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_user_id_user"
        `);
        await queryRunner.query(`
            DROP TABLE "workspace_member"
        `);
        await queryRunner.query(`
            DROP TABLE "workspace"
        `);
    }

}
