import { MigrationInterface, QueryRunner } from 'typeorm';

export class BattleManager1634154988403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attacks 
        ADD COLUMN is_under_attack boolean DEFAULT TRUE,
        ADD COLUMN is_troop_home boolean DEFAULT FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attacks
        DROP COLUMN is_under_attack,
        DROP COLUMN is_troop_home
    `);
  }
}
