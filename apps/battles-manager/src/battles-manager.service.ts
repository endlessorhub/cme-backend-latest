import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import * as _ from 'lodash';

interface casualtiesInfo {
  unitTypeId: number,
  unitTypeName: string,
  count: number,
};

interface casualtiesInfoByUnitTypeId {
  [ key: string ]: casualtiesInfo,
}

interface attackCasualties {
  [ key: string ]: {
    casualtiesInfoByUnitTypeId: casualtiesInfoByUnitTypeId,
  },
};

interface unitCharacteristics {
  health: number,
  range: number,
  damage: number,
  defense: number,
  pierce_defense: number,
  speed: number,
  food_upkeep: number,
  production_time: number,
};

interface unitInfo {
  unitTypeId: number,
  unitTypeName: string,
  characteristics?: unitCharacteristics,
  count?: number,
}

interface unitInfoByType {
  [ key: string ]: unitInfo,
}

interface attackReport {
  attackId: number,
  travelTime: number,
  attackerVillageId: number,
  defenderVillageId: number,
  winnerVillageId: number,
  loserVillageId,
  unitsInfoByType: {
    [ key: string ]: unitInfoByType,
  },
  casualties: attackCasualties,
}

enum StakeholderStatus {
  ATTACKER = 'attacker',
  DEFENDER = 'defender',
}

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
    // this.unitsInfoByType = _.keyBy(this.unitsInfo, 'id');
  }

  getStakeholderPoints(stakeholderUnitsInfoByType: unitInfoByType, stakeholderStatus: StakeholderStatus): number {
    return _.sumBy(this.unitsInfo, (unitInfo) => {
      if (stakeholderUnitsInfoByType[unitInfo.unitTypeName] === undefined) {
        return 0;
      }
      return stakeholderUnitsInfoByType[unitInfo.unitTypeName].count * (
        stakeholderStatus === StakeholderStatus.ATTACKER ?
        unitInfo.characteristics.damage :
        unitInfo.characteristics.defense + unitInfo.characteristics.pierce_defense
      );
    });
  }

  getStakeholderCasualties(stakeholderUnitsInfoByType: unitInfoByType, casualtiesRatio: number) {
    return _.mapValues(stakeholderUnitsInfoByType, (unitsInfo) => {
      return {
        ...unitsInfo,
        count: Math.round(unitsInfo.count * casualtiesRatio),
      };
    });
  }

  getUpdateValuesAsSql(stakeholderCasualties: casualtiesInfoByUnitTypeId) {
    return Object.values(stakeholderCasualties).reduce((acc, { unitTypeId, unitTypeName, count }, i) => {
      return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${count})`;
    }, '');
  }

  getAttackerUpdateValuesAsSql(unitsInfoByType: unitInfoByType, casualties: casualtiesInfoByUnitTypeId) {
    return Object.values(casualties).reduce((acc, { unitTypeId, unitTypeName, count: casualtiesCount }, i) => {
      return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${unitsInfoByType[unitTypeName].count - casualtiesCount})`;
    }, '');
  }

  async updateDb(attackReport: attackReport) {
    const {
      attackId,
      travelTime,
      attackerVillageId,
      defenderVillageId,
      winnerVillageId,
      loserVillageId,
      unitsInfoByType,
      casualties,
    } = attackReport;

    const defenderCasualtiesCount = this.getUpdateValuesAsSql(casualties[defenderVillageId].casualtiesInfoByUnitTypeId);

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
        report = '${JSON.stringify({ unitsInfoByType, casualties })}'
      WHERE
        id = ${attackId};
    `);

    if (attackerVillageId === winnerVillageId) {
      await this.redisClient.zadd(
        `delayed:return`,
        Date.now() + travelTime,
        JSON.stringify({
          attackId,
          attackerVillageId,
          attackerUnitsInfoByType: unitsInfoByType[attackerVillageId],
          attackerCasualties: casualties[attackerVillageId].casualtiesInfoByUnitTypeId,
          queue: 'pending:return',
        }),
      ).catch(e => {
        console.error(e);
      });
    }
  }

  getAttackReport({
    attackId,
    travelTime,
    attackerVillageId,
    attackerUnitsInfoByType,
    defenderVillageId,
    defenderUnitsInfoByType,
  }): attackReport {
    const attackerPoints = this.getStakeholderPoints(attackerUnitsInfoByType, StakeholderStatus.ATTACKER);
    const defenderPoints = this.getStakeholderPoints(defenderUnitsInfoByType, StakeholderStatus.DEFENDER);

    let winnerVillageId: number;
    let loserVillageId: number;
    let casualtiesBase: number;

    // Attacker points are always > 0 as the check for units count is done in the API
    if (attackerPoints > defenderPoints) {
      winnerVillageId = attackerVillageId;
      loserVillageId = defenderVillageId;
      casualtiesBase = defenderPoints / attackerPoints;
    } else if (attackerPoints < defenderPoints) {
      winnerVillageId = defenderVillageId;
      loserVillageId = attackerVillageId;
      casualtiesBase = attackerPoints / defenderPoints;
    } else {
      winnerVillageId = null;
      loserVillageId = null;
      casualtiesBase = attackerPoints / defenderPoints; // = 1
    }

    const casualtiesRatio = casualtiesBase ** (3/2);

    let attackerCasualties;
    let defenderCasualties;
    if (attackerVillageId === winnerVillageId) {
      attackerCasualties = this.getStakeholderCasualties(attackerUnitsInfoByType, casualtiesRatio);
      defenderCasualties = this.getStakeholderCasualties(defenderUnitsInfoByType, 1);
    } else if (defenderVillageId === winnerVillageId) {
      attackerCasualties = this.getStakeholderCasualties(attackerUnitsInfoByType, 1);
      defenderCasualties = this.getStakeholderCasualties(defenderUnitsInfoByType, casualtiesRatio);
    } else {
      attackerCasualties = this.getStakeholderCasualties(attackerUnitsInfoByType, 1);
      defenderCasualties = this.getStakeholderCasualties(defenderUnitsInfoByType, 1);
    }

    return {
      attackId,
      travelTime,
      attackerVillageId,
      defenderVillageId,
      winnerVillageId,
      loserVillageId,
      unitsInfoByType: {
        [attackerVillageId]: attackerUnitsInfoByType,
        [defenderVillageId]: defenderUnitsInfoByType,
      },
      casualties: {
        [attackerVillageId]: {
          casualtiesInfoByUnitTypeId: attackerCasualties,
        },
        [defenderVillageId]: {
          casualtiesInfoByUnitTypeId: defenderCasualties,
        }
      },
    };
  }

  @Cron('* * * * * *')
  async handle() {
    await Promise.mapSeries([
      // TO DO: add raid attack
      'normal',
    ],async (attackType: string) => {
      const listName = `pending:${attackType}`;
      const item = await this.redisClient.lpop(listName);
      if (!item) return;

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

      const defenderUnitsInfoByType = _.keyBy(defenderUnitsInfo, 'unitTypeName');
      
      const report = this.getAttackReport({
        attackId,
        travelTime,
        attackerVillageId,
        attackerUnitsInfoByType,
        defenderVillageId,
        defenderUnitsInfoByType,
      });

      await this.updateDb(report);
    });

    const pendingReturnsListName = 'pending:return';
    const item = await this.redisClient.lpop(pendingReturnsListName);
    if (!item) return;

    const parsed = JSON.parse(item);
    const {
      attackId,
      attackerVillageId,
      attackerUnitsInfoByType,
      attackerCasualties,
    } = parsed;

    // ****************************************************************************
    // Update multiple rows with different values and based on different conditions

    // returns a string with the following format '(unit_type_id, casualties_count)'
    const attackerCasualtiesCount = this.getAttackerUpdateValuesAsSql(attackerUnitsInfoByType, attackerCasualties);

    await this.queryRunner.query(`
      UPDATE villages_resource_types AS vrt
      SET
        count = count + v.returned_count,
        updated_at = NOW()
      FROM (values ${attackerCasualtiesCount}) AS v(unit_type_id, returned_count)
      WHERE 
        vrt.village_id = ${attackerVillageId} AND
        vrt.resource_type_id = v.unit_type_id
    `);
    // ****************************************************************************
  }
}
