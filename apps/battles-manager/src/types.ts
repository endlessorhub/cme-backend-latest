export type casualtiesInfo = {
  unitTypeId: number;
  unitTypeName: string;
  count: number;
};

export type casualtiesInfoByUnitTypeId = {
  [key: string]: casualtiesInfo;
};

export type attackCasualties = {
  [key: string]: {
    casualtiesInfoByUnitTypeId: casualtiesInfoByUnitTypeId;
  };
};

export type unitCharacteristics = {
  health: number;
  range: number;
  damage: number;
  defense: number;
  pierce_defense: number;
  speed: number;
  food_upkeep: number;
  production_time: number;
};

export type unitInfo = {
  unitTypeId: number;
  unitTypeName: string;
  characteristics?: unitCharacteristics;
  count?: number;
};

export type unitInfoByType = {
  [key: string]: unitInfo;
};

export type attackReport = {
  attackId: number;
  travelTime: number;
  attackerVillageId: number;
  defenderVillageId: number;
  winnerVillageId: number;
  loserVillageId;
  unitsInfoByType: {
    [key: string]: unitInfoByType;
  };
  casualties: attackCasualties;
};

export enum StakeholderStatus {
  ATTACKER = 'attacker',
  DEFENDER = 'defender',
}
