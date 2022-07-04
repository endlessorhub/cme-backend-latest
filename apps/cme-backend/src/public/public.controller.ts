import { Controller, Get, Query, Request } from '@nestjs/common';

import { IsInt } from 'class-validator';
import { Public } from '../public.decorator';
import { PublicService } from './public.service';

export class GetLeaders {
  @IsInt()
  limit: number;
}

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Public()
  @Get('leaders')
  async leaders(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getVillageLeaders(queryParams.limit);
  }

  @Public()
  @Get('leaders/warlike')
  async warlike(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getVillageLeadersWarLike(queryParams.limit);
  }

  @Public()
  @Get('leaders/scientist')
  async scientist(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getVillageScientist(queryParams.limit);
  }


  @Public()
  @Get('leaders/biggestStealer')
  async biggestStealer(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getBiggestStealer(queryParams.limit);
  }


}
