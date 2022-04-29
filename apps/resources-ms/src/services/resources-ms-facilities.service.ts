import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { isEmpty, some } from 'lodash';

import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { CreateFacilityMsReq } from '../service-messages';
import {
  checkIfFacilityNextLevel,
  findBuildingType,
  MILITARY_BUILDINGS,
} from '../rules';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';
import { FacilityTypePrice } from 'apps/cme-backend/src/facility-types/facility-type-price.entity';

const computeResCost = (baseCost: number, levelRequested: number) => {
  return baseCost + (baseCost * (250 * levelRequested)) / 100;
};

const computeBuildingCost = (
  baseCosts: FacilityTypePrice[],
  levelRequested: number,
) => {
  return baseCosts.map((ftp) => {
    return {
      resourceTypeId: ftp.resourceType.id,
      amount: computeResCost(ftp.amount, levelRequested),
    };
  });
};

@Injectable()
export class ResourcesMsFacilitiesService {
  private logger: Logger = new Logger('ResourcesMsFacilitiesService');

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

  async upgradeFacility(facility: Facility): Promise<Facility | HttpException> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const buildingType = findBuildingType(facility.facilityType.type);

    try {
      if (buildingType === 'militaryBuilding') {
        // it's military, check for tiers and upgrade if possible
        if (
          !checkIfFacilityNextLevel(
            facility.facilityType.type as MILITARY_BUILDINGS,
            facility.level,
          )
        ) {
          throw new Error('Facility already at max level');
        }
      }

      const resTypesCosts = computeBuildingCost(
        facility.facilityType.facilityTypePrices,
        facility.level + 1,
      );

      // First, check if the village has all the necessary resources to upgrade the facility.
      resTypesCosts.forEach((cost) => {
        const villageResource: VillageResourceType = facility.village.villagesResourceTypes.find(
          (vrt: VillageResourceType) =>
            vrt.resourceType.id === cost.resourceTypeId,
        );

        if (!villageResource || villageResource?.count < cost.amount) {
          throw new Error('Insufficient resources');
        }
      });

      // Then, remove the cost from the village.
      await resTypesCosts.forEach(async (cost) => {
        await queryRunner.query(`
        UPDATE villages_resource_types AS vrt
        SET
          count = count - ${cost.amount},
          updated_at = NOW()
        WHERE vrt.village_id = ${facility.village.id}
        AND vrt.resource_type_id = ${cost.resourceTypeId}
      `);
      });

      facility = await queryRunner.manager
        .getRepository(Facility)
        .save({ ...facility, level: facility.level + 1 });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }

    return facility;
  }

  async create(
    facility: CreateFacilityMsReq,
  ): Promise<Facility | HttpException> {
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
      return new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }

    return this.facilitiesRepository.findOne(facilityEntity.id);
  }

  async remove(id: number): Promise<void> {
    await this.facilitiesRepository.delete(id);
  }
}
