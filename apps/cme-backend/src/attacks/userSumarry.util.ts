import { Attack } from './attack.entity';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// Enable removal of useless fields in it (like user or village), to only set ids.
export type PartialAttack = DeepPartial<Attack>;

type AttacksInProgress = Readonly<{
  suffered: PartialAttack | null;
  made: ReadonlyArray<PartialAttack>;
}>;

export type UserAttackssummaryDto = Readonly<{
  // Filled with an ongoing attack to the user's village if existing,
  // and ongoing attacks made to other villages, if existing too.
  inProgress: AttacksInProgress;

  lastFiveAttacksMade: ReadonlyArray<PartialAttack>;
  lastFiveAttacksSuffered: ReadonlyArray<PartialAttack>;
}>;

export const formatSimplerAttackEntity = (attack: Attack): PartialAttack => ({
  ...attack,
  defender: {
    id: attack.defender.id,
    username: attack.defender.username,
  },
  defenderVillage: {
    id: attack.defenderVillage.id,
    name: attack.defenderVillage.name,
  },
  attacker: {
    id: attack.attacker.id,
    username: attack.attacker.username,
  },
  attackerVillage: {
    id: attack.attackerVillage.id,
    name: attack.attackerVillage.name,
  },
});

export const formatSimplerAttackList = (
  attacks: ReadonlyArray<Attack>,
): ReadonlyArray<PartialAttack> => {
  return attacks.map((attack) => formatSimplerAttackEntity(attack));
};
