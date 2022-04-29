import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, getConnection, getManager, Repository } from 'typeorm';
import * as Promise from 'bluebird';
import { minBy, max } from 'lodash';

import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { CreateVillageDto } from './dto/create-village.dto';
import { FacilityType } from '../facility-types/facility-type.entity';
import { Facility } from '../facilities/facility.entity';

const MAX_VILLAGES_PER_USER = 5;

// TODO: add this in the resources-ms if needed
const BASE_FACILITIES = ['cropland', 'iron_mine', 'sawmill'];
const RESOURCES_NEEDED_NEW_VILLAGE = 35000;

@Injectable()
export class VillagesService {
  constructor(
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FacilityType)
    private facilityTypesRepository: Repository<FacilityType>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
  ) {}

  findAll(): Promise<Village[]> {
    return this.villagesRepository.find();
  }

  findAllForUserId(userId: string): Promise<Village[]> {
    return this.villagesRepository.find({ where: { user: { id: userId } } });
  }

  findAllAround(x: number, y: number, offset: number): Promise<Village[]> {
    let x_min = x - offset;
    if (x_min < 0) {
      x_min = 0;
    }

    let y_min = y - offset;
    if (y_min < 0) {
      y_min = 0;
    }

    return this.villagesRepository.find({
      where: [
        {
          x: Between(x_min, x + offset),
          y: Between(y_min, y + offset),
        },
      ],
    });
  }

  findRectangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Promise<Village[]> {
    return this.villagesRepository.find({
      where: [
        {
          x: Between(x1, x2),
          y: Between(y1, y2),
        },
      ],
    });
  }

  findOne(id: string): Promise<Village> {
    return this.villagesRepository.findOne({
      where: { id },
      relations: ['facilities', 'villagesResourceTypes'],
    });
  }

  async createFirstFacilitiesForVillage(
    villageId: number,
  ): Promise<Facility[]> {
    const facilities = await this.facilityTypesRepository.find();
    const mainFacilities = facilities.filter((facility) =>
      BASE_FACILITIES.includes(facility.type),
    );

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const finalFacilities = [];

    try {
      mainFacilities.forEach(async (facilityType, index) => {
        const facility: any = {
          location: index,
          village: villageId,
          facilityType: facilityType.id,
          level: 1,
        };

        finalFacilities.push(
          await queryRunner.manager.getRepository(Facility).save(facility),
        );
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return finalFacilities;
  }

  checkIfHasEnoughResourcesForNewVillage(villages: Village[]): boolean {
    let totalWood = 0;
    let totalIron = 0;
    let totalFood = 0;

    villages.forEach((village) => {
      const resources = village.villagesResourceTypes.filter((res) =>
        ['food', 'iron', 'wood'].includes(res.resourceType.type),
      );

      resources.forEach((res) => {
        switch (res.resourceType.type) {
          case 'food':
            totalFood += res.count;
            break;
          case 'iron':
            totalIron += res.count;
            break;

          case 'wood':
            totalWood += res.count;
            break;

          default:
            break;
        }
      });
    });

    return (
      totalWood >= RESOURCES_NEEDED_NEW_VILLAGE &&
      totalIron >= RESOURCES_NEEDED_NEW_VILLAGE &&
      totalFood >= RESOURCES_NEEDED_NEW_VILLAGE
    );
  }

  removeResourcesForVillageCreation(villages: Village[]) {
    const leftToRemove = {
      food: RESOURCES_NEEDED_NEW_VILLAGE,
      iron: RESOURCES_NEEDED_NEW_VILLAGE,
      wood: RESOURCES_NEEDED_NEW_VILLAGE,
    };

    villages.forEach((village: Village) => {
      const resources = village.villagesResourceTypes.filter((res) =>
        ['food', 'iron', 'wood'].includes(res.resourceType.type),
      );
      const removeFromThisVillage = {
        food: 0,
        iron: 0,
        wood: 0,
      };
      const villageResourceTypesAfter: VillageResourceType[] = [];

      resources.forEach((res: VillageResourceType) => {
        const type = res.resourceType.type;

        if (leftToRemove[type] > 0 && res.count > 0) {
          const shouldRemove = minBy([res.count, leftToRemove[type]]);

          removeFromThisVillage[type] = shouldRemove;
          leftToRemove[type] -= shouldRemove;

          villageResourceTypesAfter.push({
            ...res,
            count: max([res.count - shouldRemove, 0]),
          });
        }
      });

      this.villagesResourceTypesRepository
        .save(villageResourceTypesAfter)
        .catch((e) => {
          console.error(e);
        });
    });
  }

  async create(villageDto: CreateVillageDto, userId: number): Promise<Village> {
    const user = await this.usersRepository.findOneOrFail(userId);
    const villagesForThisUser = await this.villagesRepository.find({
      where: { user: { id: userId } },
    });
    let facilities = [];

    const nbVillages = villagesForThisUser.length;

    if (nbVillages >= MAX_VILLAGES_PER_USER) {
      throw new HttpException(
        `You already have ${nbVillages} village${
          nbVillages > 1 ? 's' : ''
        }, villages creation per user is blocked to ${MAX_VILLAGES_PER_USER}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hasEnoughResources = this.checkIfHasEnoughResourcesForNewVillage(
      villagesForThisUser,
    );

    if (nbVillages > 0 && !hasEnoughResources) {
      throw new HttpException(
        `You need a total of ${RESOURCES_NEEDED_NEW_VILLAGE} of food, ${RESOURCES_NEEDED_NEW_VILLAGE} of iron and ${RESOURCES_NEEDED_NEW_VILLAGE} of iron shared between all of your villages to create a new one.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let village = { ...villageDto, user };

    await getManager().transaction(async (transactionalEntityManager) => {
      const resourceTypes = await getConnection()
        .createQueryBuilder()
        .select('resource_types')
        .from(ResourceType, 'resource_types')
        .where('resource_types.type IN (:...types)', {
          types: ['food', 'iron', 'wood', 'mkc'],
        })
        .getMany();

      let resourceQuantity = 0;

      if (user.new) {
        resourceQuantity = 100;
        await transactionalEntityManager.update(
          User,
          { id: user.id },
          { new: false },
        );
      }

      village = await transactionalEntityManager
        .getRepository(Village)
        .save(village);

      await Promise.map(resourceTypes, (resourceType) => {
        const villageResourceType = new VillageResourceType();
        Object.assign(villageResourceType, {
          resourceType,
          village,
          count: resourceQuantity,
        });
        return transactionalEntityManager.save(villageResourceType);
      });
    });

    if (nbVillages > 1 && hasEnoughResources) {
      this.removeResourcesForVillageCreation(villagesForThisUser);
    }

    facilities = await this.createFirstFacilitiesForVillage(village.id);

    return { ...village, facilities };
  }

  async remove(id: string): Promise<void> {
    await this.villagesRepository.delete(id);
  }
}
