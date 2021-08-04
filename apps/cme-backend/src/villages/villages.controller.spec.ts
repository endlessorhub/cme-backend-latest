import { mock } from 'jest-mock-extended';
import { RolesBuilder } from 'nest-access-control';
import { Test, TestingModule } from '@nestjs/testing';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';

describe('VillagesController', () => {
  let controller: VillagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VillagesController],
      providers: [
        {
          provide: VillagesService,
          useValue: mock<VillagesService>(),
        },
        {
          provide: '__roles_builder__',
          useValue: mock<RolesBuilder>(),
        }
      ]
    }).compile();

    controller = module.get<VillagesController>(VillagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
