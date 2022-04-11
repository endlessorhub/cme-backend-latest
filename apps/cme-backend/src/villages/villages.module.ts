import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';
import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { AccessControlModule } from 'nest-access-control';
import { roles } from '../app.roles';
import { Facility } from '../facilities/facility.entity';
import { FacilityType } from '../facility-types/facility-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Village]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Facility]),
    TypeOrmModule.forFeature([FacilityType]),
    AccessControlModule.forRoles(roles),
  ],
  controllers: [VillagesController],
  providers: [VillagesService],
})
export class VillagesModule {}
