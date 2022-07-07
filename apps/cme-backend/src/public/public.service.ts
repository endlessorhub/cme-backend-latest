import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

const MAX_LIMIT_LEADERS = 50;
const DEFAULT_LIMIT_LEADERS = 10;

export type VillageLeader = Readonly<{
  name: string;
  total: number;
  rank: number;
}>;


@Injectable()
export class PublicService {
  constructor(private connection: Connection) {}

  static replaceLimit(query : string, limit: number){
    return query?.replace('${limit}',limit.toString())
  }

  async getGenericLeaderRequest(
    limit: number = DEFAULT_LIMIT_LEADERS,
    query: string
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;
    try {
      rows = await queryRunner.query(PublicService.replaceLimit(query, limitChecked));
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }

    return rows;
  }



  async getVillageLeaders(
    limit: number = DEFAULT_LIMIT_LEADERS,
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;

    try {
      rows = await queryRunner.query(`
        SELECT v.name, vr.total, RANK () OVER ( 
            ORDER BY vr.total DESC 
        ) rank  FROM villages v
        LEFT JOIN 
            (SELECT village_id, SUM(count) as total FROM villages_resource_types GROUP BY village_id) vr
        ON v.id = vr.village_id
        LIMIT ${limitChecked}
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }

    return rows;
  }

  async getVillageLeadersWarLike(
    limit: number = DEFAULT_LIMIT_LEADERS,
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;

    try {
      rows = await queryRunner.query(`
        SELECT users.username, count(*) as attack_count
          FROM attacks
        LEFT JOIN 
            users on users.id = attacker_id group by users.username
        order by count_attack desc 
        LIMIT ${limitChecked}
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }

    return rows;
  }

  async getVillageScientist(
    limit: number = DEFAULT_LIMIT_LEADERS,
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;

    try {
      rows = await queryRunner.query(`
        SELECT village_id, sum(level) as tech_level, name, username 
          FROM facilities
        left join users 
        left join villages 
        on villages.user_id = users.id 
        on village_id = villages.id 
        group by village_id, villages.name, users.username 
        order by sum desc
        LIMIT ${limitChecked}
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }

    return rows;
  }

  async getBiggestStealer(
    limit: number = DEFAULT_LIMIT_LEADERS,
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;

    try {
      rows = await queryRunner.query(`
      select count(*) as stolen_volume, attacker_id, username
        from (select json_array_elements(resources_stolen)->'count' as stolen_resources, attacker_id 
          from (select stolen_resources->'resources' as resources_stolen, attacker_id from attacks where stolen_resources is not NULL) 
            as x) 
              as y 
                left join users on users.id = attacker_id 
      group by attacker_id, username order by stolen_volume desc 
      LIMIT ${limitChecked}
      `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }

    return rows;
  }



}
