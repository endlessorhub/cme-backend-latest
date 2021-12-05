import { MigrationInterface, QueryRunner } from 'typeorm';

export class StolenResources1638562031262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attacks 
        ADD COLUMN stolen_resources json,
        ADD COLUMN attacker_won boolean DEFAULT FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attacks
        DROP COLUMN stolen_resources,
        DROP COLUMN attacker_won
    `);
  }
}
