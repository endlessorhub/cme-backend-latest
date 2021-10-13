import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import * as _ from 'lodash';

import {
  casualtiesInfoByUnitTypeId,
  attackReport,
  unitInfo,
  unitInfoByType,
} from './types';
import { generateAttackReport } from './utils/attackReport';

@Injectable()
export class BattlesManagerService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;
  private unitsInfo: unitInfo[];

  constructor(
    private connection: Connection,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();

    this.unitsInfo = await this.queryRunner.query(`
      SELECT
        id as "unitTypeId",
        type as "unitTypeName", 
        characteristics
      FROM
        resource_types
      WHERE
        characteristics IS NOT NULL
    `);
  }

  getUpdateValuesAsSql(stakeholderCasualties: casualtiesInfoByUnitTypeId) {
    return Object.values(stakeholderCasualties).reduce(
      (acc, { unitTypeId, unitTypeName, count }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${count})`;
      },
      '',
    );
  }

  async updateAttackerValuesAfterReturnAsSql(
    unitsInfoByType: unitInfoByType,
    casualties: casualtiesInfoByUnitTypeId,
    attackerVillageId: number,
    attackId: number,
  ) {
    // returns a string with the following format '(unit_type_id, casualties_count)'
    const attackerCasualtiesCount = Object.values(casualties).reduce(
      (acc, { unitTypeId, unitTypeName, count: casualtiesCount }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${
          unitsInfoByType[unitTypeName].count - casualtiesCount
        })`;
      },
      '',
    );

    await this.queryRunner.query(`
      UPDATE villages_resource_types AS vrt
      SET
        count = count + v.returned_count,
        updated_at = NOW()
      FROM (values ${attackerCasualtiesCount}) AS v(unit_type_id, returned_count)
      WHERE 
        vrt.village_id = ${attackerVillageId} AND
        vrt.resource_type_id = v.unit_type_id

      UPDATE attacks
      SET
        is_troop_home = TRUE
      WHERE
        id = ${attackId};
    `);
  }

  async updateDb(attackFinalReport: attackReport) {
    const {
      attackId,
      travelTime,
      attackerVillageId,
      defenderVillageId,
      winnerVillageId,
      unitsInfoByType,
      casualties,
    } = attackFinalReport;

    const defenderCasualtiesCount = this.getUpdateValuesAsSql(
      casualties[defenderVillageId].casualtiesInfoByUnitTypeId,
    );

    const attackerWon = attackerVillageId === winnerVillageId;

    // Update the defender village resources
    await this.queryRunner.query(`
      UPDATE villages_resource_types AS vrt
      SET
        count = count - v.casualties,
        updated_at = NOW()
      FROM (values ${defenderCasualtiesCount}) AS v(unit_type_id, casualties)
      WHERE 
        vrt.village_id = ${defenderVillageId} AND
        vrt.resource_type_id = v.unit_type_id;

      UPDATE attacks
      SET
        report = '${JSON.stringify({ unitsInfoByType, casualties })}',
        is_under_attack = false
        is_troop_home = ${attackerWon ? 'FALSE' : 'TRUE'}
      WHERE
        id = ${attackId};
    `);

    // Update the attacker village resources, but only after they returned
    if (attackerWon) {
      await this.redisClient
        .zadd(
          `delayed:return`,
          Date.now() + travelTime,
          JSON.stringify({
            attackId,
            attackerVillageId,
            attackerUnitsInfoByType: unitsInfoByType[attackerVillageId],
            attackerCasualties:
              casualties[attackerVillageId].casualtiesInfoByUnitTypeId,
            queue: 'pending:return',
          }),
        )
        .catch((e) => {
          console.error(e);
        });
    }
  }

  @Cron('* * * * * *')
  async handle() {
    /**
     * This first part describes the attack itself
     */
    await Promise.mapSeries(
      [
        // TO DO: add raid attack
        'normal',
      ],
      async (attackType: string) => {
        const listName = `pending:${attackType}`;
        const item = await this.redisClient.lpop(listName);
        if (!item) {
          return;
        }

        const parsed = JSON.parse(item);
        const {
          attackId,
          travelTime,
          attackerVillageId,
          defenderVillageId,
          attackerUnitsInfoByType,
          // queue,
        } = parsed;

        const defenderUnitsInfo = await this.queryRunner.query(`
        SELECT
          vrt.resource_type_id AS "unitTypeId",
          rt.type AS "unitTypeName",
          vrt.count
        FROM
          villages_resource_types vrt
        JOIN resource_types rt ON vrt.resource_type_id = rt.id
        WHERE (
          vrt.village_id = ${defenderVillageId} AND
          rt.characteristics IS NOT NULL
        )
      `);

        const defenderUnitsInfoByType = _.keyBy(
          defenderUnitsInfo,
          'unitTypeName',
        );

        const report = generateAttackReport(
          attackId,
          travelTime,
          attackerVillageId,
          attackerUnitsInfoByType,
          defenderVillageId,
          defenderUnitsInfoByType,
          this.unitsInfo,
        );

        await this.updateDb(report);
      },
    );

    /**
     * This second part describes the update done when the attacker units come back (if they came back)
     */
    const pendingReturnsListName = 'pending:return';
    const item = await this.redisClient.lpop(pendingReturnsListName);
    if (!item) {
      return;
    }

    const parsed = JSON.parse(item);
    const {
      attackerVillageId,
      attackerUnitsInfoByType,
      attackerCasualties,
      attackId,
    } = parsed;

    this.updateAttackerValuesAfterReturnAsSql(
      attackerUnitsInfoByType,
      attackerCasualties,
      attackerVillageId,
      attackId,
    );
  }
}
