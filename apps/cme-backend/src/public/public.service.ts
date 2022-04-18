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
}
