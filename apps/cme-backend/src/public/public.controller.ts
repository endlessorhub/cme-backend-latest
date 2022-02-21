import { Controller, Get, Query, Request } from '@nestjs/common';

import { IsInt, IsString } from 'class-validator';
import { Public } from '../public.decorator';
import { PublicService } from './public.service';

export class GetLeaders {
  @IsInt()
  limit: number;
}

export class TestResourcesMS {
  @IsString()
  test: string;
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
  @Get('test-resources')
  async testResourcesMS(@Request() req, @Query() queryParams: TestResourcesMS) {
    return await this.publicService.testResourcesMS(queryParams.test);
  }
}
