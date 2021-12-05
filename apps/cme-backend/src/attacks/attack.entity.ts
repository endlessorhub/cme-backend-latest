import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';

import { Village } from '../villages/village.entity';

/**
 * This class aims to evolve when the Combat system will be created.
 */

@Entity({ name: 'attacks' })
export class Attack {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  // This represent the exact date when the attack will start.
  // TODO: update this when plugged to the combat system.
  @Column({
    name: 'attack_time',
  })
  attackTime: Date;

  @Column({
    type: 'json',
    name: 'report',
  })
  report: Record<string, any>; // TODO: create a TS type for the report

  @Column({
    name: 'is_under_attack',
  })
  isUnderAttack: boolean;

  @Column({
    name: 'is_troop_home',
  })
  isTroopHome: boolean;

  @Column({
    name: 'attacker_won',
  })
  attackerWon: boolean;

  @Column({
    type: 'json',
    name: 'stolen_resources',
  })
  stolenResources: Record<string, any>; // TODO: create a TS type for the stolen resources

  // Attacker data

  @ManyToOne(() => Village, (village) => village.attacksFrom, {
    eager: true,
  })
  @JoinColumn({
    name: 'attacker_village_id',
  })
  attackerVillage: Village;

  @ManyToOne(() => User, (user) => user.attacksFrom, {
    eager: true,
  })
  @JoinColumn({
    name: 'attacker_id',
  })
  attacker: User;

  /**
   * format to validate:
   * 
   * clubman: {
           unitTypeId: 5,
           unitTypeName: 'clubman',
           count: 3,
       },
   */
  @Column({
    type: 'json',
    name: 'unit_sent',
  })
  unitSent: Record<string, any>; // TODO: create a TS type for the unit sent format

  // Defender data

  @ManyToOne(() => Village, (village) => village.attacksTo, {
    eager: true,
  })
  @JoinColumn({
    name: 'defender_village_id',
  })
  defenderVillage: Village;

  @ManyToOne(() => User, (user) => user.attacksTo, {
    eager: true,
  })
  @JoinColumn({
    name: 'defender_id',
  })
  defender: User;
}
