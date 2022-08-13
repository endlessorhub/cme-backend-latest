import { MigrationInterface, QueryRunner } from 'typeorm';
import * as Promise from 'bluebird';
import unitsJson = require('./resources/units.json');

export class Populate1605441756285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.mapSeries(
      [
        `INSERT INTO industries (name) VALUES
                ('food'),
                ('metal'),
                ('wood'),
                ('military'),
                ('defense'),
                ('research'),
                ('trade'),
                ('cryptocurrency');`,
        `INSERT INTO facility_types (type, industry, parameters) VALUES
                ('cropland', 1, '{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }'),
                ('iron_mine', 2, '{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }'),
                ('sawmill', 3, '{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }'),
                ('barrack', 4, NULL),
                ('shooting_range', 4, NULL),
                ('military_center', 4, NULL),
                ('wall', 5, NULL),
                ('tower', 5, NULL),
                ('research_center', 6, NULL),
                ('marketplace', 7, NULL),
                ('mkc_mine', 8, '{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }'),
                ('main', NULL, NULL);`,
        `INSERT INTO resource_types (type, industry, characteristics, evolution) VALUES 
                ('food', 1, NULL, NULL), 
                ('iron', 2, NULL, NULL), 
                ('wood', 3, NULL, NULL),
                ('mkc', 8, NULL, NULL);`,
        `INSERT INTO facility_types_resource_types (facility_type_id, resource_type_id, level, level_cost) VALUES 
                (1, 1, NULL, NULL), 
                (2, 2, NULL, NULL), 
                (3, 3, NULL, NULL),
                (11, 4, NULL, NULL);`,
        `INSERT INTO facility_type_prices (facility_type_id, resource_type_id, amount) VALUES 
                (1, 2, 50), 
                (1, 3, 50), 
                (2, 1, 50), 
                (3, 1, 50), 
                (3, 2, 50), 
                (3, 3, 50),
                (4, 1, 50), 
                (4, 2, 160), 
                (4, 3, 100),
                (5, 1, 30), 
                (5, 2, 100), 
                (5, 3, 150),
                (6, 1, 150), 
                (6, 2, 260), 
                (6, 3, 80),
                (7, 1, 5), 
                (7, 2, 10), 
                (7, 3, 20),
                (8, 1, 50), 
                (8, 2, 90), 
                (8, 3, 200),
                (9, 1, 50), 
                (9, 2, 50), 
                (9, 3, 50),
                (10, 1, 400), 
                (10, 2, 30), 
                (10, 3, 40),
                (11, 1, 250),
                (11, 2, 40),
                (11, 3, 170);`,
      ],
      (query) => queryRunner.query(query),
    );

    for (const [facilityType, units] of Object.entries(unitsJson)) {
      let level = 0;
      for (const [unitType, value] of Object.entries(units)) {
        level++;
        const { characteristics, costs } = value;
        const [{ id: resourceTypeId }] = await queryRunner.query(`
                    INSERT INTO resource_types (type, industry, characteristics, evolution)
                    VALUES ('${unitType}', 3, '${JSON.stringify(
          characteristics,
        )}', NULL)
                    RETURNING id`);

        await queryRunner.query(`
                    INSERT INTO resource_type_prices (target_resource_type_id, source_resource_type_id, amount)
                    VALUES 
                    (${resourceTypeId}, 1, ${costs.food}),
                    (${resourceTypeId}, 2, ${costs.iron}),
                    (${resourceTypeId}, 3, ${costs.wood})
                `);

        await queryRunner.query(`
                    INSERT INTO facility_types_resource_types (facility_type_id, resource_type_id, level, level_cost)
                    SELECT ftq.id,  ${resourceTypeId}, ${level}, ${100 * level}
                    FROM
                    (SELECT id FROM facility_types WHERE type = '${facilityType}') ftq
                `);
      }
    }

    await queryRunner.query(`INSERT INTO "users" ("id", "email", "username", "password", "eth_wallet_addresses", "role", "new", "created_at", "updated_at") VALUES
    (1, 'admin@monkeyempire.net', 'admin', '0',	NULL, NULL, '0', NOW(), NOW())
    RETURNING id`);

    await queryRunner.query(`
    INSERT INTO "villages" ("id", "name", "population", "x", "y", "eth_wallet_address", "created_at", "updated_at", "user_id") VALUES
    (1, 'adminville',  0,  1,  1,  NULL,   NOW(),  NOW(),  1);

    INSERT INTO "villages_resource_types" ("id", "village_id", "resource_type_id", "count", "created_at", "updated_at") VALUES
    (1,	1,	1,	100,	NOW(),	NOW()),
    (2,	1,	2,	100,	NOW(),	NOW()),
    (3,	1,	3,	100,	NOW(),	NOW());
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('facility_types_resource_types');
    await queryRunner.clearTable('resource_type_prices');
    await queryRunner.clearTable('facility_types');
    await queryRunner.clearTable('resource_types');
    await queryRunner.clearTable('industries');
  }
}
