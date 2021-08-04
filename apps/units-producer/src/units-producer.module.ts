import { ConfigurationModule, ConfigurationService } from '@app/configuration';
import { RedlockModule } from '@app/redlock';
import { SchedulerModule } from '@app/scheduler';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import { UnitsProducerController } from './units-producer.controller';
import { UnitsProducerService } from './units-producer.service';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Module({
  imports: [
    ConfigurationModule.register({projectRoot: path.resolve(__dirname, '..')}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) => configurationService.get('typeorm'),
      inject: [ConfigurationService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) => configurationService.get('db.redis'),
      inject: [ConfigurationService],
    }),
    ScheduleModule.forRoot(),
    SchedulerModule,
    RedlockModule,
  ],
  controllers: [UnitsProducerController],
  providers: [UnitsProducerService],
})
export class UnitsProducerModule {
  constructor(private _connection: Connection) {}
}
