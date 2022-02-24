import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CreateOrderDto } from 'apps/cme-backend/src/orders/dto/create-order.dto';
import { CreateFacilityDto } from 'apps/cme-backend/src/facilities/dto/create-facility.dto';

import { ResourcesMicroServiceMessages } from './service-messages';
import { ResourcesMsService } from './resources-ms.service';

@Controller()
export class ResourcesMsController {
  constructor(private readonly resourcesMsService: ResourcesMsService) {}

  /**
   * FACILITIES
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.CREATE_FACILITY })
  async createFacility(facility: CreateFacilityDto): Promise<any> {
    return {};
  }

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.FIND_FACILITY })
  async findFacilityById(facilityId: number): Promise<any> {
    return {};
  }

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.GET_VILLAGE_FACILITIES })
  async getFacilitiesForVillage(villageId: number): Promise<any> {
    return {};
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
   * TODO: define types for these units
   * TODO: Add a "Common Types" TS lib (try a nestJS lib to use it anywhere easily) to use the same types everywhere
   *
   * @param unitsInfo
   * @returns
   */
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.MERGE_UNIT_RULES })
  async mergeUnitsRules(unitsInfo: ReadonlyArray<any>): Promise<any> {
    return {};
  }

  // A simple method that returns the string given in parameter, to test the validity of this MS
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.TEST_SERVICE })
  async testMicroServiceCall(data: string): Promise<string> {
    console.log('===== received request');
    return `the data sent by the ms: ${data}`;
  }
}
