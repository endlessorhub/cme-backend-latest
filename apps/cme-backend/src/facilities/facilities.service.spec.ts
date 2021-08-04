import { Connection, Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { EventsGateway } from '../events/events.gateway';
import { RedlockService } from '@app/redlock';
import { Facility } from './facility.entity';
import { FacilityTypePrice } from '../facility-types/facility-type-price.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';

describe('FacilitiesService', () => {
  let service: FacilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        {
          provide: Connection,
          useValue: mock<Connection>(),
        },
        {
          provide: RedlockService,
          useValue: mock<RedlockService>(),
        },
        {
          provide: 'FacilityRepository',
          useValue: mock<Repository<Facility>>(),
        },
        {
          provide: 'FacilityTypePriceRepository',
          useValue: mock<Repository<FacilityTypePrice>>(),
        },
        {
          provide: 'VillageResourceTypeRepository',
          useValue: mock<Repository<VillageResourceType>>(),
        },
        {
          provide: EventsGateway,
          useValue: mock<EventsGateway>(),
        },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
