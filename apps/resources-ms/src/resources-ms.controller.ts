import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { ResourcesMicroServiceMessages } from './service-messages';
import { ResourcesMsService } from './resources-ms.service';

@Controller()
export class ResourcesMsController {
  constructor(private readonly resourcesMsService: ResourcesMsService) {}

  // A simple method that returns the string given in parameter, to test the validity of this MS
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.TEST_SERVICE })
  async testMicroServiceCall(data: string): Promise<string> {
    console.log('===== received request');
    return `the data sent by the ms: ${data}`;
  }
}
