import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1743246646985 implements MigrationInterface {
    name = 'CreateUserTable1743246646985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "bio" character varying DEFAULT '',
                "image" character varying DEFAULT '',
                "email_verified" boolean NOT NULL DEFAULT false,
                "verify_token" uuid,
                "verify_expires" TIMESTAMP WITH TIME ZONE,
                "reset_token" uuid,
                "reset_expires" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_user_verify_token" ON "user" ("verify_token")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_user_reset_token" ON "user" ("reset_token")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_user_reset_token"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_user_verify_token"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }

}
