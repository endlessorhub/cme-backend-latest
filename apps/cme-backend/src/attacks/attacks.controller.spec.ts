import { Test, TestingModule } from '@nestjs/testing';
import { AttacksController } from './attacks.controller';
import { AttacksService } from './attacks.service';

describe('AttacksController', () => {
  let controller: AttacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttacksController],
      providers: [AttacksService],
    }).compile();

    controller = module.get<AttacksController>(AttacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
