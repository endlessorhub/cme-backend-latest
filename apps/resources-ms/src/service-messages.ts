import { CreateFacilityDto } from 'apps/cme-backend/src/facilities/dto/create-facility.dto';

export const ResourcesMicroServiceName = 'RESOURCES_MS';

export const ResourcesMicroServiceMessages = {
  TEST_SERVICE: `${ResourcesMicroServiceName}test_service`,
  CREATE_FACILITY: `${ResourcesMicroServiceName}_create_facility`,
  FIND_FACILITY: `${ResourcesMicroServiceName}_find_facility`,
  GET_VILLAGE_FACILITIES: `${ResourcesMicroServiceName}_get_village_facilities`,
  REMOVE_FACILITY: `${ResourcesMicroServiceName}_remove_facility`,
  CREATE_ORDER: `${ResourcesMicroServiceName}_create_order`,
  GET_VILLAGE_RESOURCES: `${ResourcesMicroServiceName}_get_village_resources`,
  MERGE_UNIT_RULES: `${ResourcesMicroServiceName}_merge_unit_rules`,
};

export type FindFacilityMsReq = Readonly<{
  facilityId: number;
  userId: number;
}>;

export type CreateFacilityMsReq = CreateFacilityDto;

export type FindFacilitiesForVillageMsReq = Readonly<{
  villageId: number;
}>;

export type RemoveFacilityMsReq = Readonly<{
  facilityId: number;
}>;
