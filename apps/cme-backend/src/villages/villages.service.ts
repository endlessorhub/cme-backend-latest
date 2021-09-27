import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, getConnection, getManager, Repository } from 'typeorm';
import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { CreateVillageDto } from './dto/create-village.dto';
import * as Promise from 'bluebird';
import { off } from 'process';



@Injectable()
export class VillagesService {

  

  constructor(
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Village[]> {
    return this.villagesRepository.find();
  }

  findAllAround(x: number, y: number, offset: number): Promise<Village[]> {
    const MAP_SIZE = 64;
    let x_min = x - offset;
    if(x_min < 0){ x_min = 0;}

    let x_max = x + offset;
    if(x_max > MAP_SIZE){ x_max = MAP_SIZE;}

    let y_min = y - offset;
    if(y_min < 0){y_min = 0;}

    let y_max = y + offset;
    if(y_max > MAP_SIZE){y_max = MAP_SIZE;}

    return this.villagesRepository.find({ 
                    where: [
                    {
                      x:Between(x_min, x_max) , y:Between(y_min, y_max) 
                    }
                    ]});
  }

  findRectangle(x1: number, y1: number, x2: number, y2 : number): Promise<Village[]> {
    return this.villagesRepository.find({ 
                    where: [
                    {
                      x:Between(x1, x2) , y:Between(y2, y2) 
                    }
                    ]});
  }

  findOne(id: string): Promise<Village> {
    return this.villagesRepository.findOne({ where: { id }, relations: ['facilities', 'villagesResourceTypes']});
  }

  async create(villageDto: CreateVillageDto, userId: number): Promise<Village> {
    const user = await this.usersRepository.findOneOrFail(userId);

    let village = { ...villageDto, user };

    await getManager().transaction(async transactionalEntityManager => {
      const resourceTypes = await getConnection()
          .createQueryBuilder()
          .select('resource_types')
          .from(ResourceType, 'resource_types')
          .where('resource_types.type IN (:...types)', { types: ['food', 'iron', 'wood', 'mkc'] })
          .getMany();

      let resourceQuantity = 0;

      if (user.new) {
          resourceQuantity = 100;
          await transactionalEntityManager.update(User, { id: user.id }, { new: false });
      }

      // Maybe a way to save the Entity from DTO directly through Entity Manager without using Repository ?
      // https://github.com/nestjs/nest/issues/918
      // https://github.com/scalio/nest-workshop-backend/blob/master/src/common/interceptors/transform.interceptor.ts
      village = await transactionalEntityManager.getRepository(Village).save(village);

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

    return village;
  }

  async remove(id: string): Promise<void> {
    await this.villagesRepository.delete(id);
  }
}