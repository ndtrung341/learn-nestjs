import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSessionTable1742712434741 implements MigrationInterface {
    name = 'CreateSessionTable1742712434741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "token" character varying(255) NOT NULL,
                "invalid" boolean NOT NULL DEFAULT false,
                "expires_in" integer NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_SESSION_USER" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_SESSION_USER"
        `);
        await queryRunner.query(`
            DROP TABLE "session"
        `);
    }

}
