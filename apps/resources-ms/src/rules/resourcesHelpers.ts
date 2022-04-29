// Todo: add helper functions when needed, using the rules and types described.

import { BUILDINGS } from '.';

export type typesOfBuildings = 'building' | 'militaryBuilding';

export const findBuildingType = (type: string): typesOfBuildings => {
  if ((<any>Object).values(BUILDINGS).includes(type)) {
    return 'building';
  }

  return 'militaryBuilding';
};
