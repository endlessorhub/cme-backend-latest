import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilityInUse1661095783589 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE facilities 
            ADD COLUMN is_in_production boolean DEFAULT FALSE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE facilities
            DROP COLUMN is_in_production
        `);
  }
}
