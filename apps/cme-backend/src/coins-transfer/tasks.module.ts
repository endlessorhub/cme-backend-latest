import { BlockchainModule } from '@app/blockchain';
import { Module } from '@nestjs/common';
import { TransferCoinCronService } from './transfer.servie';

@Module({
  imports: [BlockchainModule],
  providers: [TransferCoinCronService],
  exports: [TransferCoinCronService],
})
export class TasksModule {}
