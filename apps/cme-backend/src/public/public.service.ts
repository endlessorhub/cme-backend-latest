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
  private queryRunner: QueryRunner;
  private resourcesMSClient: ClientProxy;

  constructor(private connection: Connection) {
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

  testResourcesMS(test: string) {
    const pattern = { cmd: ResourcesMicroServiceMessages.TEST_SERVICE };

    return this.resourcesMSClient.send<string>(pattern, test);
  }
}
