import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Village } from '../villages/village.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { IsOptional } from 'class-validator';

@Entity({ name: 'villages_resource_types' })
export class VillageResourceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  count: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Village, (village) => village.villagesResourceTypes)
  @JoinColumn({
    name: 'village_id',
  })
  village: Village;

  @ManyToOne(
    () => ResourceType,
    (resourceType) => resourceType.villagesResourceTypes,
    {
      eager: true,
    },
  )
  @JoinColumn({
    name: 'resource_type_id',
  })
  resourceType: ResourceType;

  toJSON?() {
    return {
      ...this,
      count: Number(this.count),
    };
  }
}
