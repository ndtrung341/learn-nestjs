import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1743246646985 implements MigrationInterface {
   name = 'CreateUserTable1743246646985';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            CREATE TABLE "user" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying,
                "first_name" character varying,
                "last_name" character varying,
                "bio" character varying DEFAULT '',
                "image" character varying DEFAULT '',
                "email_verified" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user" PRIMARY KEY ("id")
            )
        `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            DROP TABLE "user"
        `);
   }
}
