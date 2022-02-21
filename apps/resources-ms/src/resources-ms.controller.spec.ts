import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesMsController } from './resources-ms.controller';
import { ResourcesMsService } from './resources-ms.service';

describe('ResourcesMsController', () => {
  let resourcesMsController: ResourcesMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesMsController],
      providers: [ResourcesMsService],
    }).compile();

    resourcesMsController = app.get<ResourcesMsController>(ResourcesMsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(resourcesMsController.getHello()).toBe('Hello World!');
    });
  });
});
