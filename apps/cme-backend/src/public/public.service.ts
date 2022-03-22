import { Inject, Injectable } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

import {
  ResourcesMicroServiceName,
  ResourcesMicroServiceMessages,
} from 'apps/resources-ms/src/service-messages';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

const MAX_LIMIT_LEADERS = 50;
const DEFAULT_LIMIT_LEADERS = 10;

export type VillageLeader = Readonly<{
  name: string;
  total: number;
  rank: number;
}>;

@Injectable()
export class PublicService {
  private resourcesMSClient: ClientProxy;

  constructor(private connection: Connection) {
    console.log('====== CREATING A NEW CLIENT FOR THE PUBLIC SERVICE');
    this.resourcesMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'resources-ms',
        port: 3004,
      },
    });
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

  testResourcesMS(test: string) {
    const pattern = { cmd: ResourcesMicroServiceMessages.TEST_SERVICE };

    return this.resourcesMSClient.send<string>(pattern, test);
  }
}
