import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Facility } from './facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { EventsGateway } from '../events/events.gateway';

import * as Promise from 'bluebird';
import * as _ from 'lodash';
import { Cron } from '@nestjs/schedule';
import { RedlockService } from '@app/redlock';

@Injectable()
export class FacilitiesService {
  constructor(
    private connection: Connection,
    private eventsGateway: EventsGateway,
    private redlockService: RedlockService,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
  ) {}

  findAll(): Promise<Facility[]> {
    return this.facilitiesRepository.find();
  }

  findOne(id: string): Promise<Facility> {
    return this.facilitiesRepository.findOne(id);
  }

  async create(facility: CreateFacilityDto): Promise<Facility> {
    let facilityEntity;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rows = await queryRunner.query(`
        SELECT ftp.resource_type_id, ftp.amount, vrt.count
        FROM facility_type_prices ftp
        LEFT JOIN villages_resource_types vrt
        ON ftp.resource_type_id = vrt.resource_type_id
        WHERE ftp.facility_type_id = ${facility.facilityType}
        AND vrt.village_id = ${facility.village}
      `);

      if (_.some(rows, row => row.count < row.amount)) {
        throw new Error('Insufficient resources');
      }

      await queryRunner.query(`
        UPDATE villages_resource_types AS vrt
        SET
          count = count - ftp.amount,
          updated_at = NOW()
        FROM facility_type_prices AS ftp
        WHERE ftp.facility_type_id = ${facility.facilityType}
        AND ftp.resource_type_id = vrt.resource_type_id
        AND vrt.village_id = ${facility.village}
      `);

      facilityEntity = await queryRunner.manager.getRepository(Facility).save(facility);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
      // throw new HttpException('Insufficient resources', HttpStatus.CONFLICT);
    } finally {
      await queryRunner.release();
    }

    return this.facilitiesRepository.findOne(facilityEntity.id);
  }

  async remove(id: string): Promise<void> {
    await this.facilitiesRepository.delete(id);
  }

  // Every minute
  @Cron('* * * * *')
  async produceResources() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    // await queryRunner.startTransaction();

    this.redlockService.attempt('facilities-service:produce-resources', 10000, async () => {
      try {
        // Should return more data for edited records so that the front-end can keep fully up-to-date models
        const $results = await queryRunner.stream(`
          WITH grouped_results AS (
            SELECT
              u.id user_id,
              vrt.id village_resource_type_id,
              v.id village_id,
              ft.id facility_type_id,
              ft.parameters facility_type_parameters,
              vrt.resource_type_id resource_type_id,
              f.level,
              COUNT(f.id) facility_count,
              ARRAY_AGG(f.id) facility_ids
            FROM 
                villages_resource_types vrt
            JOIN villages v ON vrt.village_id = v.id
            JOIN facility_types_resource_types ftrt ON vrt.resource_type_id = ftrt.resource_type_id
            JOIN facilities f ON vrt.village_id = f.village_id AND f.facility_type_id = ftrt.facility_type_id
            JOIN facility_types ft ON f.facility_type_id = ft.id
            JOIN users u ON v.user_id = u.id
            WHERE (
              (
                f.last_production_at IS NOT NULL AND 
                f.last_production_at < NOW() - (ft.parameters->>'frequency' || ' seconds')::interval
              ) OR
              (
                f.last_production_at IS NULL AND 
                f.created_at < NOW() - (ft.parameters->>'frequency' || ' seconds')::interval
              )
            )
            GROUP BY u.id, vrt.id, v.id, ft.id, vrt.resource_type_id, f.level
          ), vrt_updated AS (
            UPDATE villages_resource_types vrt
            SET
              count = count + CAST(grouped_results.facility_type_parameters->>'quantity' AS INTEGER) * grouped_results.facility_count * POWER(1 + CAST(grouped_results.facility_type_parameters->>'increase_rate' AS FLOAT), level),
              updated_at = NOW()
            FROM grouped_results
            WHERE 
              vrt.id = grouped_results.village_resource_type_id
            RETURNING grouped_results.user_id, vrt.village_id, vrt.resource_type_id AS resource_type_id, vrt.count AS count, grouped_results.facility_ids
          ), updated_facilities AS (
            UPDATE facilities f
            SET 
              last_production_at = NOW(),
              updated_at = NOW()
            FROM vrt_updated
            WHERE f.id = ANY(vrt_updated.facility_ids)
          )
  
          SELECT
            vrt_updated.user_id, vrt_updated.village_id, vrt_updated.resource_type_id AS resource_type_id, vrt_updated.count AS count
          FROM vrt_updated
        `);

        $results.on('data', (result) => {
          console.log(result);
          const resultAsJson = JSON.parse(JSON.stringify(result));
          this.eventsGateway.server.to(`user-${resultAsJson.user_id}`).emit('increase_resource_qty', resultAsJson);
        });
      } catch (err) {
        // await queryRunner.rollbackTransaction();
        console.error('FacilitiesService.produceResources()', err);
        // throw err;
      } finally {
        await queryRunner.release();
      }
    });
  }
}
