import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { some } from 'lodash';

import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { CreateFacilityMsReq } from '../service-messages';

@Injectable()
export class ResourcesMsFacilitiesService {
  private logger: Logger = new Logger('AppController');

  constructor(
    private connection: Connection,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
  ) {}

  findAllForVillage(villageId: number): Promise<Facility[]> {
    return this.facilitiesRepository.find({
      where: { village: { id: villageId } },
    });
  }

  findOne(id: number): Promise<Facility> {
    return this.facilitiesRepository.findOne({
      where: { id },
    });
  }

  async create(facility: CreateFacilityMsReq): Promise<Facility> {
    let facilityEntity: Facility;

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

      if (some(rows, (row) => row.count < row.amount)) {
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

      facilityEntity = await queryRunner.manager
        .getRepository(Facility)
        .save(facility);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
      // TODO: find the best way to handle this error while in MS
      // throw new HttpException('Insufficient resources', HttpStatus.CONFLICT);
    } finally {
      await queryRunner.release();
    }

    return this.facilitiesRepository.findOne(facilityEntity.id);
  }

  async remove(id: number): Promise<void> {
    await this.facilitiesRepository.delete(id);
  }
}
