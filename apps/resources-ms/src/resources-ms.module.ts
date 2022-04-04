import * as path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';

import { ConfigurationModule, ConfigurationService } from '@app/configuration';
import { RedlockModule } from '@app/redlock';

import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { FacilityTypePrice } from 'apps/cme-backend/src/facility-types/facility-type-price.entity';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';
import { EventsModule } from 'apps/cme-backend/src/events/events.module';

import { ResourcesMsController } from './resources-ms.controller';
import { ResourcesMsFacilitiesService } from './services/resources-ms-facilities.service';
import { ResourcesUpdaterCronService } from './services/resources-updater-cron.service';
import { ResourcesMsOrdersService } from './services/resources-ms-orders.service';
import { ResourcesMsService } from './services/resources-ms.service';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('typeorm'),
      inject: [ConfigurationService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('db.redis'),
      inject: [ConfigurationService],
    }),
    EventsModule,
    RedlockModule,
    TypeOrmModule.forFeature([Facility]),
    TypeOrmModule.forFeature([FacilityTypePrice]),
    TypeOrmModule.forFeature([VillageResourceType]),
  ],
  controllers: [ResourcesMsController],
  providers: [
    ResourcesMsFacilitiesService,
    ResourcesUpdaterCronService,
    ResourcesMsOrdersService,
    ResourcesMsService,
  ],
})
export class ResourcesMsModule {
  constructor(private _connection: Connection) {}
}
