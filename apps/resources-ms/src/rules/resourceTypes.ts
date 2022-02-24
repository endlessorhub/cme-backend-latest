/**
 * Basic resources
 */

export enum RESOURCES {
  FOOD = 'food',
  WOOD = 'wood',
  IRON = 'iron',
  MKC = 'mkc',
}

export const resourcesList: ReadonlyArray<RESOURCES> = [
  RESOURCES.FOOD,
  RESOURCES.WOOD,
  RESOURCES.IRON,
  RESOURCES.MKC,
];

/**
 * Basic buildings
 */

export enum BUILDINGS {
  CROPLAND = 'cropland',
  SAWMILL = 'sawmill',
  IRON_MINE = 'iron_mine',
  MONKEY_COIN_MINE = 'monkey_coin_mine',
}

export const buildingList: ReadonlyArray<BUILDINGS> = [
  BUILDINGS.CROPLAND,
  BUILDINGS.SAWMILL,
  BUILDINGS.IRON_MINE,
  BUILDINGS.MONKEY_COIN_MINE,
];

export type BuildingUnit = Readonly<{
  name: BUILDINGS;
  resource: RESOURCES;
  unitsPerHourProduction: number;
}>;
