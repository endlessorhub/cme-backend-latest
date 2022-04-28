import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { isEmpty, some, uniq } from 'lodash';
import { RedisService } from 'nestjs-redis';

import { CreateOrderMsReq } from '../service-messages';
import { Order } from 'apps/cme-backend/src/orders/orders.entity';

@Injectable()
export class ResourcesMsOrdersService {
  private logger: Logger = new Logger('ResourcesMsOrdersService');

  constructor(
    private connection: Connection,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private redisService: RedisService,
  ) {}

  async create(order: CreateOrderMsReq): Promise<Order | HttpException> {
    let orderEntity;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      /* const [ {id: villageId} ] = await queryRunner.query(`
        SELECT village_id
        FROM facilities
        WHERE id = ${order.facility}
      `); */

      const rows: Array<any> = uniq(
        await queryRunner.query(`
        SELECT
          f.id,
          f.facility_type_id,
          f.level,
          f.village_id,
          ftrt.facility_type_id,
          rtp.source_resource_type_id,
          rtp.target_resource_type_id,
          rtp.amount,
          rt.id,
          rt.type,
          rt.characteristics,
          vrt.count
        FROM facilities f
        LEFT JOIN facility_types_resource_types ftrt
          ON f.facility_type_id = ftrt.facility_type_id
        LEFT JOIN resource_type_prices rtp
          ON ftrt.resource_type_id = rtp.target_resource_type_id
        LEFT JOIN resource_types rt
          ON rtp.target_resource_type_id = rt.id
        LEFT JOIN villages_resource_types vrt
          ON f.village_id = vrt.village_id
        WHERE f.id = ${order.facilityId}
        AND f.level = ftrt.level
        AND vrt.resource_type_id = rtp.source_resource_type_id
      `),
      );

      if (
        some(rows, (row) => row.count < row.amount * order.orderedQuantity) ||
        isEmpty(rows)
      ) {
        throw new Error('Insufficient resources');
      }

      const {
        village_id: villageId,
        target_resource_type_id: resourceTypeId,
        type: resourceType,
        characteristics: { production_time: productionTime },
      }: any = rows[0];

      const productionTimeAsMilliseconds = productionTime * 1000;

      const resourceTypeIdAmounts = rows.reduce((acc, row, i) => {
        return `${acc}${i === 0 ? '' : ','}(${row.source_resource_type_id},${
          row.amount * order.orderedQuantity
        })`;
      }, '');

      await queryRunner.query(`
        UPDATE villages_resource_types AS vrt
        SET
          count = count - v.amount,
          updated_at = NOW()
        FROM (values ${resourceTypeIdAmounts}) AS v(resource_type_id, amount)
        WHERE 
          vrt.village_id = ${villageId} AND
          vrt.resource_type_id = v.resource_type_id
    `);

      order.resourceType = resourceTypeId;
      order.facility = { id: order.facilityId };
      orderEntity = await queryRunner.manager.getRepository(Order).save(order);
      await queryRunner.commitTransaction();

      const redisClient = await this.redisService.getClient();
      await redisClient
        .zadd(
          `delayed:${resourceType}`,
          Date.now() + productionTimeAsMilliseconds,
          JSON.stringify({
            orderId: orderEntity.id,
            resourceTypeId: orderEntity.resourceType,
            orderedQuantity: orderEntity.orderedQuantity,
            productionTime,
            villageId,
            queue: `pending:${resourceType}`,
            action: 'create',
          }),
        )
        .catch((e) => {
          console.error(e);
        });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }

    orderEntity = await this.ordersRepository.findOne(orderEntity.id);

    return orderEntity;
  }
}
