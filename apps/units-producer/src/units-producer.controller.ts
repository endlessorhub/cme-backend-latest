import { Controller } from '@nestjs/common';
import { UnitsProducerService } from './units-producer.service';

@Controller()
export class UnitsProducerController {
  constructor(private readonly unitsProducerService: UnitsProducerService) {}
}
