import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { VillagesService } from './villages.service';
import { Village } from './village.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';

describe('VillagesService', () => {
  let service: VillagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VillagesService,
        {
          provide: 'VillageRepository',
          useValue: mock<Repository<Village>>(),
        },
        {
          provide: 'UserRepository',
          useValue: mock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<VillagesService>(VillagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
