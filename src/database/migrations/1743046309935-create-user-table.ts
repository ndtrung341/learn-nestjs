import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1743046309935 implements MigrationInterface {
   name = 'CreateUserTable1743046309935';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            CREATE TABLE "users" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_5d96c2b4e28dfcd11ab3bbd928" ON "users" ("verify_token")
        `);
      await queryRunner.query(`
            CREATE INDEX "IDX_dec0bae70633e911fe6a5983c1" ON "users" ("reset_token")
        `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_dec0bae70633e911fe6a5983c1"
        `);
      await queryRunner.query(`
            DROP INDEX "public"."IDX_5d96c2b4e28dfcd11ab3bbd928"
        `);
      await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
      await queryRunner.query(`
            DROP TABLE "users"
        `);
   }
}
