import { BlockchainModule } from '@app/blockchain';
import { Module } from '@nestjs/common';
import { TransferCoinCronService } from './transfer.service';
import { UserRepository } from '../users/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [BlockchainModule, TypeOrmModule.forFeature([UserRepository])],
  providers: [TransferCoinCronService],
  exports: [TransferCoinCronService],
})
export class TasksModule {}
