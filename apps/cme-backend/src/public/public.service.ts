import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

const MAX_LIMIT_LEADERS = 50;
const DEFAULT_LIMIT_LEADERS = 20;

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

}
