import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedlockService } from '@app/redlock';

import { resourcesCronQuery } from './resourcesCronQuery';

/**
 * This service contains the Cron(s) used to update every resources of every facility in the game.
 */
@Injectable()
export class ResourcesUpdaterCronService {
  private logger: Logger = new Logger('AppController');

  constructor(
    private connection: Connection,
    private redlockService: RedlockService,
  ) {}

  // Launched every minute.
  // See https://docs.nestjs.com/techniques/task-scheduling for more info.
  @Cron(CronExpression.EVERY_MINUTE)
  async produceResources() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    this.redlockService.attempt(
      'facilities-service:produce-resources',
      10000,
      async () => {
        try {
          this.logger.debug('Resources CRON --- starting update');
          const stream = await queryRunner.stream(resourcesCronQuery);

          stream.on('data', (result) => {
            const resultAsJson = JSON.parse(JSON.stringify(result));
            this.logger.debug(
              'Resources CRON --- resources updated',
              resultAsJson,
            );
            // TODO: see if really needed to send an event to the front
            // this.eventsGateway.server
            //   .to(`user-${resultAsJson.user_id}`)
            //   .emit('increase_resource_qty', resultAsJson);
          });
        } catch (err) {
          this.logger.error('FacilitiesService.produceResources()', err);
        } finally {
          await queryRunner.release();
          this.logger.debug('Resources CRON --- finished update');
        }
      },
    );
  }
}
