import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

import {
  GetBalanceMsReq,
  BlockchainMicroServiceMessages,
} from 'apps/blockchain-ms/src/service-messages';

@ApiBearerAuth()
@Controller('mkc')
export class MKCController {
  private resourcesMSClient: ClientProxy;

  constructor() {
    this.resourcesMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'blockchain-ms',
        port: 3005,
      },
    });
  }

  @Get('wallet')
  wallet(@Request() req) {
    const pattern = {
      cmd: BlockchainMicroServiceMessages.GET_BALANCE,
    };
    const request: GetBalanceMsReq = {
      userId: req.user.id,
    };

    return this.resourcesMSClient.send<any, GetBalanceMsReq>(pattern, request);
  }
}
