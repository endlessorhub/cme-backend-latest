import { Controller, Get, HttpException, HttpStatus, Param, Query, Request } from '@nestjs/common';

import { IsInt, IsString } from 'class-validator';
import { Public } from '../public.decorator';
import { LeaderBoardType, LEADERS_QUERIES } from './leaderboards.util';
import { PublicService } from './public.service';

export class GetLeaders {
  @IsInt()
  limit: number;

  @IsString()
  leaderBoardType : LeaderBoardType;
}

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Public()
  @Get('leaders')
  async leaders(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getGenericLeaderRequest(queryParams.limit, "economicLeaders");
  }

  @Public()
  @Get('leaders/generic/:leaderBoardType')
  async generic(@Request() req, @Query() queryParams: GetLeaders, @Param('leaderBoardType') leaderBoardType: string) {
    if(leaderBoardType in LEADERS_QUERIES) {
      return await this.publicService.getGenericLeaderRequest(queryParams.limit, LEADERS_QUERIES[leaderBoardType]);
    }
    throw new HttpException(`BAD Request ${leaderBoardType} not valid`, HttpStatus.BAD_REQUEST);
    
  }

  @Public()
  @Get('leaders/generic/:leaderBoardType')
  async generic(@Request() req, @Query() queryParams: GetLeaders, @Param('leaderBoardType') leaderBoardType: string) {
    if(leaderBoardType in LEADERS_QUERIES) {
      return await this.publicService.getGenericLeaderRequest(queryParams.limit, LEADERS_QUERIES[leaderBoardType]);
    }
    throw new HttpException(`BAD Request ${leaderBoardType} not valid`, HttpStatus.BAD_REQUEST);
    
  }


}
