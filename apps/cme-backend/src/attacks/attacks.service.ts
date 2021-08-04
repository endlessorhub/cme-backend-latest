import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'nestjs-redis';

import { CreateAttackDto } from './dto/create-attack.dto';
import { User } from '../users/user.entity';
import { Village } from '../villages/village.entity';
import { Attack } from './attack.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';

const HOUR_AS_MS = 60 * 60 * 1000;

@Injectable()
export class AttacksService {
  constructor(
    @InjectRepository(Attack)
    private readonly attacksRepository: Repository<Attack>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
    private redisService: RedisService,
  ) {}

  async create(createAttackDto: CreateAttackDto): Promise<any> {
    const attackerVillage = await this.villagesRepository.findOneOrFail({
      where: { id: createAttackDto.attackerVillageId },
      relations: ['villagesResourceTypes'],
    });
    const defenderVillage = await this.villagesRepository.findOneOrFail(
      createAttackDto.defenderVillageId,
    );

    if (attackerVillage.user.id === defenderVillage.user.id) {
      throw new Error('A user cannot attack themselve');
    }

    // check if the village has enough units and store the slowest speed
    let slowestSpeed = 0;

    Object.keys(createAttackDto.unitSent).forEach((resourceName) => {
      const resourceRequested = createAttackDto.unitSent[resourceName];
      const resourceAvailable = attackerVillage.villagesResourceTypes?.find(
        (villageResourceType) =>
          villageResourceType.resourceType.id === resourceRequested.unitTypeId,
      );

      if (
        !resourceAvailable ||
        resourceAvailable.count < resourceRequested.count
      ) {
        throw new Error(`Quantity of unit ${resourceName} insuficient`);
      }

      if (
        slowestSpeed === 0 ||
        slowestSpeed < resourceAvailable.resourceType.characteristics.speed
      ) {
        slowestSpeed = resourceAvailable.resourceType.characteristics.speed;
      }
    });

    const distance = Math.sqrt(
      Math.pow(defenderVillage.x - attackerVillage.x, 2) +
      Math.pow(defenderVillage.y - attackerVillage.y, 2)
    );

    const attack = {
      attackerVillage,
      attacker: attackerVillage.user,
      defenderVillage,
      defender: defenderVillage.user,
      unitSent: createAttackDto.unitSent,
    };

    const attackEntity = await this.attacksRepository.save(attack);
    const redisClient = await this.redisService.getClient();
    const travelTimeAsHours = distance / slowestSpeed;
    const travelTimeAsMs = Math.round(travelTimeAsHours * HOUR_AS_MS);

    await redisClient
      .zadd(
        `delayed:normal`,
        Date.now() + travelTimeAsMs,
        JSON.stringify({
          attackId: attackEntity.id,
          travelTime: travelTimeAsMs,
          attackerVillageId: attackerVillage.id,
          defenderVillageId: defenderVillage.id,
          attackerUnitsInfoByType: createAttackDto.unitSent,
        }),
      )
      .catch((e) => {
        console.error(e);
      });

    // Compute the village resourceTypes without the units sent in battle
    const attackerVillageResourceTypesLeftDuringAttack = attackerVillage.villagesResourceTypes.map(
      (villageResourceType) => {
        const resourceRequested =
          createAttackDto.unitSent[villageResourceType.resourceType.type];

        if (!resourceRequested) {
          return villageResourceType;
        }

        const countLeftDuringAttack =
          villageResourceType.count -
          resourceRequested.count;

        villageResourceType.count = countLeftDuringAttack;

        return villageResourceType;
      },
    );

    // Save the updated resourceTypes.
    await this.villagesResourceTypesRepository.save(
      attackerVillageResourceTypesLeftDuringAttack,
    ).catch(e => {
      console.log(e);
    });

    // Save the new attack.
    return this.attacksRepository.save(attack);
  }

  findAll() {
    return this.attacksRepository.find();
  }

  findOne(id: string) {
    return this.attacksRepository.findOne(id);
  }

  // Todo: when the combat system is ready, find a way to update the attack_time + other values from here.
  //
  // update(id: number, updateAttackDto: UpdateAttackDto) {
  //   return `This action updates a #${id} attack`;
  // }

  async remove(id: string): Promise<void> {
    await this.attacksRepository.delete(id);
  }
}
