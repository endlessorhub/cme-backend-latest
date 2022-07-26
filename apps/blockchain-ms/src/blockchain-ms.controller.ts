import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import {
  GetBalanceMsReq,
  BlockchainMicroServiceMessages,
} from './service-messages';
import { BlockchainMsIngameMKCService } from './services/blockchain-ms-ingame-mkc.service';

@Controller()
export class BlockchainMsController {
  constructor(
    private readonly ingameMKCService: BlockchainMsIngameMKCService,
  ) {}

  /**
   * User's ingame MKC.
   */
  @MessagePattern({ cmd: BlockchainMicroServiceMessages.GET_BALANCE })
  async getUserGlobalBalance(data: GetBalanceMsReq): Promise<any> {
    return await this.ingameMKCService.getBalance(data.userId);
  }

  /**
   * MKC relay (blockchain connector).
   */
}
