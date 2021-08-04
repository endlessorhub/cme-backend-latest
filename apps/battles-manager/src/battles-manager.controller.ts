import { Controller } from '@nestjs/common';
import { BattlesManagerService } from './battles-manager.service';

@Controller()
export class BattlesManagerController {
  constructor(private readonly battlesManagerService: BattlesManagerService) {}
}
