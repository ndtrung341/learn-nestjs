import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1742712206856 implements MigrationInterface {
   name = 'CreateUserTable1742712206856';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "bio" character varying NOT NULL DEFAULT '',
                "image" character varying NOT NULL DEFAULT '',
                "email_verified" boolean NOT NULL DEFAULT false,
                "verify_token" uuid,
                "verify_expires" TIMESTAMP WITH TIME ZONE,
                "reset_token" uuid,
                "reset_expires" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email")
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_66ed4fc9d9dd93b731ee5e7bbd" ON "user" ("verify_token")
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_bb2b6e1e67308fbea9e5bc1300" ON "user" ("reset_token")
        `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_bb2b6e1e67308fbea9e5bc1300"
        `);
      await queryRunner.query(`
            DROP INDEX "public"."IDX_66ed4fc9d9dd93b731ee5e7bbd"
        `);
      await queryRunner.query(`
            DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"
        `);
      await queryRunner.query(`
            DROP TABLE "user"
        `);
   }
}
