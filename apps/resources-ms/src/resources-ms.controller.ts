import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CreateOrderDto } from 'apps/cme-backend/src/orders/dto/create-order.dto';
import { ResourceInfo, ResourceUnitInfo } from './rules/mainResourcesTypes';
import { mergeRulesToList } from './rules/militaryResourcesHelpers';

import {
  CreateFacilityMsReq,
  FindFacilitiesForVillageMsReq,
  FindFacilityMsReq,
  RemoveFacilityMsReq,
  ResourcesMicroServiceMessages,
} from './service-messages';
import { ResourcesMsFacilitiesService } from './services/resources-ms.service';

@Controller()
export class ResourcesMsController {
  constructor(
    private readonly resourcesMsFacilitiesService: ResourcesMsFacilitiesService,
  ) {}

  /**
   * FACILITIES
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.CREATE_FACILITY })
  async createFacility(data: CreateFacilityMsReq): Promise<any> {
    return await this.resourcesMsFacilitiesService.create(data);
  }

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.FIND_FACILITY })
  async findFacilityById(data: FindFacilityMsReq): Promise<any> {
    const res = await this.resourcesMsFacilitiesService.findOne(
      data.facilityId,
    );

    if (!res) {
      return new HttpException('Facility not found', HttpStatus.NOT_FOUND);
    }

    if (res.village.user.id !== data.userId) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return res;
  }

  // TODO: check if need to check what user does the request
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.GET_VILLAGE_FACILITIES })
  async getFacilitiesForVillage(
    data: FindFacilitiesForVillageMsReq,
  ): Promise<any> {
    return await this.resourcesMsFacilitiesService.findAllForVillage(
      data.villageId,
    );
  }

  // TODO: check if need to check what user does the request
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.REMOVE_FACILITY })
  async removeFacility(data: RemoveFacilityMsReq): Promise<any> {
    return await this.resourcesMsFacilitiesService.remove(data.facilityId);
  }

  /**
   * ORDERS
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.CREATE_ORDER })
  async createOrder(order: CreateOrderDto): Promise<any> {
    return {};
  }

  /**
   * RESOURCES
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.GET_VILLAGE_RESOURCES })
  async getResourcesForVillage(villageId: number): Promise<any> {
    return {};
  }

  /**
   * Merges a list of units with their actual characteristics (rules).
   *
   * TODO: Migrate the main resources types (info) as a nestJS lib to use the same types everywhere (do while migrating the battle manager)
   *
   * @param unitsInfo
   * @returns
   */
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.MERGE_UNIT_RULES })
  mergeUnitsRules(
    unitsInfo: Array<ResourceInfo>,
  ): Array<ResourceInfo | ResourceUnitInfo> {
    return mergeRulesToList(unitsInfo);
  }

  // A simple method that returns the string given in parameter, to test the validity of this MS
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.TEST_SERVICE })
  async testMicroServiceCall(data: string): Promise<string> {
    console.log('===== received request');
    return `the data sent by the ms: ${data}`;
  }
}
