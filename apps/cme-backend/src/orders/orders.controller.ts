import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

import {
  ResourcesMicroServiceMessages,
  CreateOrderMsReq,
} from 'apps/resources-ms/src/service-messages';

import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './orders.entity';

@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  private resourcesMSClient: ClientProxy;

  constructor(
    private connection: Connection,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {
    this.resourcesMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'resources-ms',
        port: 3004,
      },
    });
  }

  // TODO: check with front if route used
  @Get()
  index() {
    return this.ordersRepository.find();
  }

  // TODO: check with front if route used
  @Get(':id')
  show(@Param('id') id: string) {
    return this.ordersRepository.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() order: CreateOrderDto) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.CREATE_ORDER,
    };

    return this.resourcesMSClient.send<any, CreateOrderMsReq>(pattern, order);
  }
}
