import { mock } from 'jest-mock-extended';
import { RedisService } from 'nestjs-redis';
import { Connection, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Order } from './orders.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: Connection,
          useValue: mock<Connection>(),
        },
        {
          provide: RedisService,
          useValue: mock<RedisService>(),
        },
        {
          provide: 'OrderRepository',
          useValue: mock<Repository<Order>>(),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
