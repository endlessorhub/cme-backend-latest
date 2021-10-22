import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'nestjs-redis';
import { Connection, Repository } from 'typeorm';
import { Order } from './orders.entity';
import { FacilityTypePrice } from '../facility-types/facility-type-price.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import * as _ from 'lodash';

@Injectable()
export class OrdersService {
    constructor(
        private connection: Connection,
        // private eventsGateway: EventsGateway,
        private redisService: RedisService,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        // @InjectRepository(FacilityTypePrice)
        // private facilityTypePricesRepository: Repository<FacilityTypePrice>,
        // @InjectRepository(VillageResourceType)
        // private villagesResourceTypesRepository: Repository<VillageResourceType>,
    ) {}

    findAll(): Promise<Order[]> {
        return this.ordersRepository.find();
    }

    findOne(id: string): Promise<Order> {
        return this.ordersRepository.findOne(id);
    }

    async create(order: CreateOrderDto): Promise<Order> {
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

          const rows = _.uniq(await queryRunner.query(`
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
          `)); // Or rt.characteristics with DISTINCT clause , joining rt ON rtp.source_resource_type = rt.id to avoid handling deduplication in the code

          if (_.some(rows, row => row.count < row.amount * order.orderedQuantity) || _.isEmpty(rows)) {
            throw new Error('Insufficient resources');
          }

          const {
            village_id: villageId,
            target_resource_type_id: resourceTypeId,
            type: resourceType,
            characteristics: {
              production_time: productionTime
            }
          } = rows[0];

          const productionTimeAsMilliseconds = productionTime * 1000;

          const resourceTypeIdAmounts = rows.reduce((acc, row, i) => {
            return `${acc}${i === 0 ? '' : ','}(${row.source_resource_type_id},${row.amount * order.orderedQuantity})`
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
          order.facility = {id: order.facilityId}
          orderEntity = await queryRunner.manager.getRepository(Order).save(order);
          await queryRunner.commitTransaction();
          
          const redisClient = await this.redisService.getClient();
          await redisClient.zadd(
            `delayed:${resourceType}`,
            Date.now() + productionTimeAsMilliseconds,
            JSON.stringify({
              orderId: orderEntity.id,
              resourceTypeId: orderEntity.resourceType,
              orderedQuantity: orderEntity.orderedQuantity,
              productionTime,
              villageId,
              queue: `pending:${resourceType}`,
              action: 'create'
            }),
          ).catch(e => {
            console.error(e);
          });
        } catch (err) {
          await queryRunner.rollbackTransaction();
          throw err;
          // throw new HttpException('Insufficient resources', HttpStatus.CONFLICT);
        } finally {
          await queryRunner.release();
        }

        orderEntity = await this.ordersRepository.findOne(orderEntity.id);

        return orderEntity;
    }

    async remove(id: string): Promise<void> {
        await this.ordersRepository.delete(id);
    }
}
