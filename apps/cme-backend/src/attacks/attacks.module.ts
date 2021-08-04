import { Module } from '@nestjs/common';
import { AttacksService } from './attacks.service';
import { AttacksController } from './attacks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attack } from './attack.entity';
import { User } from '../users/user.entity';
import { Village } from '../villages/village.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attack]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Village]),
    TypeOrmModule.forFeature([VillageResourceType]),
  ],
  controllers: [AttacksController],
  providers: [AttacksService],
})
export class AttacksModule {}
