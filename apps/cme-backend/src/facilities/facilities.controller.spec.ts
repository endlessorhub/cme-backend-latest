import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        {
          provide: FacilitiesService,
          useValue: mock<FacilitiesService>(),
        }
      ],
    }).compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
