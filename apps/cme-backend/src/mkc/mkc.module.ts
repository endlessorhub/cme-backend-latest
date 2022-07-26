import { Module } from '@nestjs/common';
import { MKCController } from './mkc.controller';
import { EventsModule } from '../events/events.module';
import { RedlockModule } from '@app/redlock';

@Module({
  imports: [EventsModule, RedlockModule],
  controllers: [MKCController],
  providers: [],
})
export class MkcModule {}
