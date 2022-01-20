import { Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

const MAX_LIMIT_LEADERS = 50;
const DEFAULT_LIMIT_LEADERS = 10;

export type VillageLeader = Readonly<{
  name: string;
  total: number;
  rank: number;
}>;

@Injectable()
export class PublicService {
  private queryRunner: QueryRunner;

  constructor(private connection: Connection) {}

  async getVillageLeaders(
    limit: number = DEFAULT_LIMIT_LEADERS,
  ): Promise<ReadonlyArray<VillageLeader>> {
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();

    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;

    return await this.queryRunner.query(`
        SELECT v.name, vr.total, RANK () OVER ( 
            ORDER BY vr.total DESC 
        ) rank  FROM villages v
        LEFT JOIN 
            (SELECT village_id, SUM(count) as total FROM villages_resource_types GROUP BY village_id) vr
        ON v.id = vr.village_id
        LIMIT ${limitChecked}
    `);

    return [];
  }
}
