import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSessionTable1743246700270 implements MigrationInterface {
    name = 'CreateSessionTable1743246700270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "session" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying(255) NOT NULL,
                "invalid" boolean NOT NULL DEFAULT false,
                "expires_in" integer NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_session" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_session_user_id_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_session_user_id_user"
        `);
        await queryRunner.query(`
            DROP TABLE "session"
        `);
    }

}
