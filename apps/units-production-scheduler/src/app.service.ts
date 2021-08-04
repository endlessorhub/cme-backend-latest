import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulerService } from '@app/scheduler';
import * as Promise from 'bluebird';
import { RedlockService } from '@app/redlock';

@Injectable()
export class AppService {

  constructor(
    private schedulerService: SchedulerService,
    private redlockService: RedlockService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  @Cron('* * * * * *')
  async moveDelayedTasksToPendingTasksList() {
    // TO DO: fetch from DB
    const resourceTypes = [
      'clubman',
      'maceman',
      'short_sword',
      'long_word',
      'rock_thrower',
      'slinger',
      'shortbow',
      'spearman',
      'pikeman',
    ];

    const eventsType = [
      'normal',
      'return',
    ];

    await Promise.map([ ...resourceTypes, ...eventsType ], (type: string) => {
      const zsetName = `delayed:${type}`;
      const listName = `pending:${type}`;
      const lockName = `triggered-resource-producer:schedule:${zsetName}`;
      return this.redlockService.attempt(lockName, 10000, async() => {
        await this.schedulerService.moveFromZsetToList({
          delayedTasksZsetKey: zsetName,
          start: 0,
          stop: 20,
          pendingTasksListKey: listName,
        });
      });
    });
  }
}
