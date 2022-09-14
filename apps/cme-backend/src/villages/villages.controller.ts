import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { isEmpty } from 'lodash';

import { VillagesService } from './villages.service';
import { CreateVillageDto } from './dto/create-village.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Village } from './village.entity';
import { GetVillagesRectangle } from './../villages-resource-types/village-query-level-stream';
import { VillageResourcesSummary } from './types';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import {
  ExchangeMilitaryResourcesOwnVillagesDto,
  ExchangeResourcesOwnVillagesDto,
} from './dto/exchange-resource-own.dto';
import {
  ExchangeMilitaryResBetweenOwnVillageMsReq,
  ExchangeResBetweenOwnVillageMsReq,
  ResourcesMicroServiceMessages,
} from '../../../resources-ms/src/service-messages';

@ApiBearerAuth()
@Controller('villages')
export class VillagesController {
  private resourcesMSClient: ClientProxy;

  constructor(
    private villagesService: VillagesService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {
    this.resourcesMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'resources-ms',
        port: 3004,
      },
    });
  }

  @Get()
  async index(
    @Request() req,
    @Query() queryParams: GetVillagesRectangle,
  ): Promise<Village[]> {
    const permission = this.rolesBuilder.can(req.user.roles).readAny('village');

    if (queryParams.x1 && queryParams.y1 && queryParams.x2 && queryParams.y2) {
      return permission.filter(
        await this.villagesService.findRectangle(
          queryParams.x1,
          queryParams.y1,
          queryParams.x2,
          queryParams.y2,
        ),
      );
    } else if (queryParams.x1 && queryParams.y1 && queryParams.offset) {
      return permission.filter(
        await this.villagesService.findAllAround(
          queryParams.x1,
          queryParams.y1,
          queryParams.offset,
        ),
      );
    } else {
      return permission.filter(await this.villagesService.findAll());
    }
  }

  // Should stay declared before the /:id to avoid the router thinking "own" is an id.
  @Get('own')
  async myVillages(@Request() req) {
    return await this.villagesService.findAllForUserId(req.user.id);
  }

  @Get(':id')
  async show(@Request() req, @Param('id') id: string) {
    const village = await this.villagesService.findOne(id);
    if (village.user.id !== req.user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }
    const permission = this.rolesBuilder.can(req.user.roles).readOwn('village');
    return permission.filter(village);
  }

  @Get(':id/resources')
  async showResources(
    @Request() req,
    @Param('id') id: string,
  ): Promise<VillageResourcesSummary> {
    const village: Village = await this.villagesService.findOne(id);
    if (village.user.id !== req.user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    const fighters = [];
    const others = [];

    village.villagesResourceTypes?.forEach((res: VillageResourceType) => {
      const baseInfo = {
        name: res.resourceType.type,
        industryId: res.resourceType.industry,
        count: res.count,
        id: res.resourceType.id,
      };

      if (!isEmpty(res.resourceType.characteristics)) {
        fighters.push({
          ...baseInfo,
          health: res.resourceType.characteristics['health'],
          range: res.resourceType.characteristics['range'],
          damage: res.resourceType.characteristics['damage'],
          defense: res.resourceType.characteristics['defense'],
          pierce_defense: res.resourceType.characteristics['pierce_defense'],
          speed: res.resourceType.characteristics['speed'],
          food_upkeep: res.resourceType.characteristics['food_upkeep'],
          production_time: res.resourceType.characteristics['production_time'],
        });
      } else {
        others.push(baseInfo);
      }
    });

    return {
      fighters,
      others,
    };
  }

  @Post(':id/send-resources')
  @UsePipes(new ValidationPipe({ transform: true }))
  sendResourcesFromVillage(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ExchangeResourcesOwnVillagesDto,
  ) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.EXCHANGE_RESOURCES_OWN_VILLAGES,
    };
    const request: ExchangeResBetweenOwnVillageMsReq = {
      senderVillageId: Number(id),
      receiverVillageId: body.receiverVillageId,
      sentResources: body.resourcesSent,
      userId: req.user.id,
    };

    return this.resourcesMSClient.send<any, ExchangeResBetweenOwnVillageMsReq>(
      pattern,
      request,
    );
  }

  @Post(':id/send-military-resources')
  @UsePipes(new ValidationPipe({ transform: true }))
  sendMilitaryResourcesFromVillage(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ExchangeMilitaryResourcesOwnVillagesDto,
  ) {
    const pattern = {
      cmd:
        ResourcesMicroServiceMessages.EXCHANGE_MILITARY_RESOURCES_OWN_VILLAGES,
    };
    const request: ExchangeMilitaryResBetweenOwnVillageMsReq = {
      senderVillageId: Number(id),
      receiverVillageId: body.receiverVillageId,
      sentResources: body.resourcesSent,
      userId: req.user.id,
    };

    console.log('called send military resources from village controller');
    return this.resourcesMSClient.send<
      any,
      ExchangeMilitaryResBetweenOwnVillageMsReq
    >(pattern, request);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Request() req, @Body() village: CreateVillageDto) {
    return this.villagesService.create(village, req.user.id);
  }
}
