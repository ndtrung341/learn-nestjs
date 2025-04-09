import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkspaceAndMemberTable1744096996488 implements MigrationInterface {
    name = 'CreateWorkspaceAndMemberTable1744096996488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "workspace_member" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "workspace_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "role" "public"."workspace_member_role_enum" NOT NULL DEFAULT 'member',
                "invited_by_id" uuid,
                "invited_at" TIMESTAMP WITH TIME ZONE,
                "joined_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_workspace_member" UNIQUE ("user_id", "workspace_id"),
                CONSTRAINT "PK_workspace_member_workspace_id_user_id" PRIMARY KEY ("workspace_id", "user_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "workspace" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying DEFAULT '',
                "owner_id" uuid NOT NULL,
                "visibility" "public"."workspace_visibility_enum" NOT NULL DEFAULT 'private',
                CONSTRAINT "PK_workspace" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member"
            ADD CONSTRAINT "FK_workspace_member_workspace_id_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member"
            ADD CONSTRAINT "FK_workspace_member_user_id_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member"
            ADD CONSTRAINT "FK_workspace_member_invited_by_id_user" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace"
            ADD CONSTRAINT "FK_workspace_owner_id_user" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace" DROP CONSTRAINT "FK_workspace_owner_id_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_invited_by_id_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_user_id_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_workspace_id_workspace"
        `);
        await queryRunner.query(`
            DROP TABLE "workspace"
        `);
        await queryRunner.query(`
            DROP TABLE "workspace_member"
        `);
    }

}
