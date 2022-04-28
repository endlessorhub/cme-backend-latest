import { RedlockService } from '@app/redlock';
import { SchedulerService } from '@app/scheduler';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner } from 'typeorm';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class UnitsProducerService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;

  constructor(
    private connection: Connection,
    private schedulerService: SchedulerService,
    private redisService: RedisService,
    private redlockService: RedlockService,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();
  }

  @Cron('* * * * * *')
  // TO DO: use RMQ instead of Redis lists
  // or at least use BRPOPLPUSH to limit number of redis calls and ensure some reliability
  async produce() {
    // TO DO: fetch from DB
    await Promise.mapSeries(
      [
        'clubman',
        'maceman',
        'short_sword',
        'long_sword',
        'rock_thrower',
        'slinger',
        'shortbow',
        'spearman',
        'pikeman',
      ],
      async (resourceType: string) => {
        const listName = `pending:${resourceType}`;
        const item = await this.redisClient.lpop(listName);
        if (!item) return;

        const parsed = JSON.parse(item);
        const {
          orderId,
          resourceTypeId,
          orderedQuantity,
          productionTime,
          villageId,
          queue,
          action,
        } = parsed;

        const productionTimeAsMilliseconds = productionTime * 1000;

        const rows = await this.queryRunner.query(`
        SELECT
          orders.id,
          orders.delivered_quantity,
          orders.ordered_quantity,
          vrt.resource_type_id,
          vrt.count
        FROM orders
        LEFT JOIN villages_resource_types vrt
          ON orders.resource_type_id = vrt.resource_type_id
        WHERE
          orders.id = ${orderId} AND
          vrt.village_id = ${villageId}
      `);

        let deliveredQuantity;
        let villageResourceTypeCount;

        if (rows.length === 1) {
          deliveredQuantity = rows[0].delivered_quantity;
          villageResourceTypeCount = rows[0].count;
        } else if (rows.length > 1) {
          throw new Error(
            'More than 1 row matching orders and villages_resource_types',
          );
        }

        if (
          (rows.length === 0 || deliveredQuantity < orderedQuantity) &&
          action === 'create'
        ) {
          await this.queryRunner.startTransaction();
          try {
            let query = `
            UPDATE orders
            SET
              delivered_quantity = delivered_quantity + 1,
              updated_at = NOW()
            WHERE
              id = ${orderId};
          `;
            if (villageResourceTypeCount == null) {
              query = `
              ${query}
              INSERT INTO villages_resource_types (village_id, resource_type_id, count)
              VALUES (${villageId}, ${resourceTypeId}, 1)
            `;
            } else {
              query = `
              ${query}
              UPDATE villages_resource_types
              SET
                count = count + 1,
                updated_at = NOW()
              WHERE
                village_id = ${villageId} AND
                resource_type_id = ${resourceTypeId}
            `;
            }
            await this.queryRunner.query(query);
            await this.queryRunner.commitTransaction();

            if (rows.length === 0 || deliveredQuantity + 1 < orderedQuantity) {
              await this.redisClient
                .zadd(
                  `delayed:${resourceType}`,
                  Date.now() + productionTimeAsMilliseconds,
                  JSON.stringify({
                    orderId,
                    resourceTypeId,
                    orderedQuantity,
                    productionTime,
                    villageId,
                    queue,
                    action: 'create',
                  }),
                )
                .catch((e) => {
                  console.error(e);
                });
            }
          } catch (err) {
            await this.queryRunner.rollbackTransaction();
            console.error(err);
          }
        }
      },
    );
  }
}
