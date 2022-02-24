import {
  MilitaryResourceUnit,
  MILITARY_RESOURCES,
  MilitaryBuildingUnit,
  MILITARY_BUILDINGS,
} from './militaryResourceTypes';

/**
 * Mililitary building descriptors.
 */

export const barrackDescriptor: MilitaryBuildingUnit = {
  name: MILITARY_BUILDINGS.BARRACK,
  maxTier: 4,
  tiers: [
    {
      tier: 1,
      availableMilitaryResources: [MILITARY_RESOURCES.CLUBMAN],
    },
    {
      tier: 2,
      availableMilitaryResources: [
        MILITARY_RESOURCES.CLUBMAN,
        MILITARY_RESOURCES.MACEMAN,
      ],
    },
    {
      tier: 3,
      availableMilitaryResources: [
        MILITARY_RESOURCES.CLUBMAN,
        MILITARY_RESOURCES.MACEMAN,
        MILITARY_RESOURCES.SHORT_SWORD,
      ],
    },
    {
      tier: 4,
      availableMilitaryResources: [
        MILITARY_RESOURCES.CLUBMAN,
        MILITARY_RESOURCES.MACEMAN,
        MILITARY_RESOURCES.SHORT_SWORD,
        MILITARY_RESOURCES.LONG_SWORD,
      ],
    },
  ],
};

export const shootingRangeDescriptor: MilitaryBuildingUnit = {
  name: MILITARY_BUILDINGS.SHOOTING_RANGE,
  maxTier: 3,
  tiers: [
    {
      tier: 1,
      availableMilitaryResources: [MILITARY_RESOURCES.ROCK_THROWER],
    },
    {
      tier: 2,
      availableMilitaryResources: [
        MILITARY_RESOURCES.ROCK_THROWER,
        MILITARY_RESOURCES.SLINGER,
      ],
    },
    {
      tier: 3,
      availableMilitaryResources: [
        MILITARY_RESOURCES.ROCK_THROWER,
        MILITARY_RESOURCES.SLINGER,
        MILITARY_RESOURCES.SHORT_BOW,
      ],
    },
  ],
};

export const militaryCenterDescriptor: MilitaryBuildingUnit = {
  name: MILITARY_BUILDINGS.MILITARY_CENTER,
  maxTier: 2,
  tiers: [
    {
      tier: 1,
      availableMilitaryResources: [MILITARY_RESOURCES.SPEARMAN],
    },
    {
      tier: 2,
      availableMilitaryResources: [
        MILITARY_RESOURCES.SPEARMAN,
        MILITARY_RESOURCES.PIKEMAN,
      ],
    },
  ],
};

/**
 * Barrack resources descriptors.
 */

export const clubmanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.CLUBMAN,
  characteristics: {
    hp: 100,
    range: 1,
    damage: 8,
    defense: 4,
    pierceDefense: 2,
    speed: 10,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 1,
    food: 10,
    wood: 10,
    mkc: 1,
  },
  productionTime: 10,
};

export const macemanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.MACEMAN,
  characteristics: {
    hp: 120,
    range: 1,
    damage: 12,
    defense: 5,
    pierceDefense: 2,
    speed: 10,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 10,
    food: 15,
    wood: 5,
    mkc: 2,
  },
  productionTime: 12,
};

export const shortSwordDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SHORT_SWORD,
  characteristics: {
    hp: 140,
    range: 1,
    damage: 14,
    defense: 5,
    pierceDefense: 4,
    speed: 10,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 15,
    food: 15,
    wood: 10,
    mkc: 4,
  },
  productionTime: 10,
};

export const longSwordDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.LONG_SWORD,
  characteristics: {
    hp: 150,
    range: 1,
    damage: 16,
    defense: 7,
    pierceDefense: 6,
    speed: 10,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 20,
    food: 18,
    wood: 10,
    mkc: 5,
  },
  productionTime: 16,
};

/**
 * Shooting Range resources descriptors.
 */

export const rockThrowerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.ROCK_THROWER,
  characteristics: {
    hp: 40,
    range: 3,
    damage: 6,
    defense: 2,
    pierceDefense: 2,
    speed: 12,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 2,
    food: 5,
    wood: 10,
    mkc: 1,
  },
  productionTime: 12,
};

export const slingerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SLINGER,
  characteristics: {
    hp: 60,
    range: 4,
    damage: 8,
    defense: 2,
    pierceDefense: 2,
    speed: 12,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 4,
    food: 8,
    wood: 15,
    mkc: 2,
  },
  productionTime: 14,
};

export const shortBowDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SHORT_BOW,
  characteristics: {
    hp: 60,
    range: 4,
    damage: 8,
    defense: 2,
    pierceDefense: 2,
    speed: 12,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 4,
    food: 8,
    wood: 15,
    mkc: 4,
  },
  productionTime: 14,
};

/**
 * Military Center resources descriptors.
 */

export const spearmanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SPEARMAN,
  characteristics: {
    hp: 90,
    range: 1,
    damage: 15,
    defense: 6,
    pierceDefense: 1,
    speed: 10,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 18,
    food: 15,
    wood: 10,
    mkc: 3,
  },
  productionTime: 16,
};

export const pikemanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.PIKEMAN,
  characteristics: {
    hp: 110,
    range: 2,
    damage: 18,
    defense: 7,
    pierceDefense: 2,
    speed: 9,
    foodUpkeep: 1,
  },
  productionCosts: {
    iron: 15,
    food: 18,
    wood: 25,
    mkc: 4,
  },
  productionTime: 16,
};
