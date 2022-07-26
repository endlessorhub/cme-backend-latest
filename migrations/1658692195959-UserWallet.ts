import { MigrationInterface, QueryRunner } from 'typeorm';

const DB_ATTACK_NAME = 'user_mkc_wallets';

export class UserWallet1658692195959 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE ${DB_ATTACK_NAME} (
        id serial PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        user_id int DEFAULT NULL REFERENCES users (id),
        balance decimal DEFAULT 0
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE ${DB_ATTACK_NAME}`);
  }
}
