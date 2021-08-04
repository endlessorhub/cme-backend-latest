import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilityTypesService } from './facility-types.service';
import { FacilityType } from './facility-type.entity';
import { mock } from 'jest-mock-extended';

describe('FacilityTypesService', () => {
  let service: FacilityTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityTypesService,
        {
          provide: 'FacilityTypeRepository',
          useValue: mock<Repository<FacilityType>>(),
        },
      ],
    }).compile();

    service = module.get<FacilityTypesService>(FacilityTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
