import { MigrationInterface, QueryRunner } from 'typeorm';

const DB_ATTACK_NAME = 'attacks';

export class Attack1623596420521 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // The attack_time will be updated by the combat system.
    await queryRunner.query(`CREATE TABLE ${DB_ATTACK_NAME} (
      id serial PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      attack_time timestamptz,
      attacker_village_id int NOT NULL REFERENCES villages (id),
      attacker_id int DEFAULT NULL REFERENCES users (id),
      defender_village_id int NOT NULL REFERENCES villages (id),
      defender_id int DEFAULT NULL REFERENCES users (id),
      report json,
      unit_sent json NOT NULL
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE ${DB_ATTACK_NAME}`);
  }
}
