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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  index() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() facility: CreateOrderDto) {
    return this.ordersService.create(facility);
  }
}

// TODO: uncomment when merging

// import { Connection } from 'typeorm';
// import {
//   ClientProxyFactory,
//   Transport,
//   ClientProxy,
// } from '@nestjs/microservices';

// import {
//   ResourcesMicroServiceMessages,
//   CreateOrderMsReq,
// } from 'apps/resources-ms/src/service-messages';

// @ApiBearerAuth()
// @Controller('orders')
// export class OrdersNController {
//   private resourcesMSClient: ClientProxy;

//   constructor(private connection: Connection) {
//     this.resourcesMSClient = ClientProxyFactory.create({
//       transport: Transport.TCP,
//       options: {
//         host: 'resources-ms',
//         port: 3004,
//       },
//     });
//   }

//   @Post()
//   @UsePipes(new ValidationPipe({ transform: true }))
//   create(@Body() order: CreateOrderDto) {
//     const pattern = {
//       cmd: ResourcesMicroServiceMessages.CREATE_FACILITY,
//     };

//     return this.resourcesMSClient.send<any, CreateOrderMsReq>(pattern, order);
//   }
// }
