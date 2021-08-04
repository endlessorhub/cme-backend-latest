import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service'
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
        return this.ordersService.findOne(id)
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() facility: CreateOrderDto) {
        return this.ordersService.create(facility);
    }
}
