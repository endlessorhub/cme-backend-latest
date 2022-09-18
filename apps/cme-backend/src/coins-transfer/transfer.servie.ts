import { BlockchainService, RPCService } from '@app/blockchain';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

const Web3 = require('web3');

@Injectable()
export class TransferCoinCronService {
  constructor(
    private blockchainService: BlockchainService,
    private rpcService: RPCService, // private appConfigService: AppConfigService, // private cronJobService: CRONJobService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async setRewardsPerSecond() {
    console.log('cron running');
  }
}
