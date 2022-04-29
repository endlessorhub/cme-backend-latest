import {
  MilitaryResourceUnitCharacteristics,
  MILITARY_BUILDINGS,
  MILITARY_RESOURCES,
} from './militaryResourceTypes';
import { ResourceInfo, ResourceUnitInfo } from './mainResourcesTypes';
import {
  relatedMilitaryBuildingDescriptors,
  relatedUnitDescriptors,
} from './militaryResourcesRules';
import { militaryResourceList } from '.';

// Todo: add helper functions when needed, using the rules and types described.
export const isMilitaryResource = (
  resourceInfo: ResourceInfo | ResourceUnitInfo,
): boolean => {
  return (
    militaryResourceList.indexOf(
      resourceInfo.unitTypeName as MILITARY_RESOURCES,
    ) >= 0
  );
};

const getRelatedCharacteristic = (
  unitTypeName: MILITARY_RESOURCES,
): MilitaryResourceUnitCharacteristics =>
  relatedUnitDescriptors[unitTypeName].characteristics;

export const addCharacteristicToResource = (
  resourceInfo: ResourceInfo,
): ResourceInfo | ResourceUnitInfo => {
  if (!isMilitaryResource(resourceInfo)) {
    return resourceInfo;
  }

  return {
    ...resourceInfo,
    characteristics: getRelatedCharacteristic(
      resourceInfo.unitTypeName as MILITARY_RESOURCES,
    ),
  } as ResourceUnitInfo;
};

export const mergeRulesToList = (
  resources: Array<ResourceInfo>,
): Array<ResourceInfo | ResourceUnitInfo> => {
  return resources.map((res) => addCharacteristicToResource(res));
};

export const checkIfFacilityNextLevel = (
  type: MILITARY_BUILDINGS,
  actualTier: number,
) => {
  return relatedMilitaryBuildingDescriptors[type].maxTier > actualTier;
};
