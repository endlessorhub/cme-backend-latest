import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToOne,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
// import { Facility} from "../facilities/facility.entity";
// import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';
import { FacilityType } from '../facility-types/facility-type.entity';
import { ResourceType } from '../resource-types/resource-type.entity';

@Entity({name: 'facility_type_prices'})
@Unique(['facilityType', 'resourceType'])
export class FacilityTypePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @ManyToOne(() => FacilityType, facilityType => facilityType.facilityTypePrices)
  @JoinColumn({
    name: 'facility_type_id'
  })
  facilityType: FacilityType;

  @ManyToOne(() => ResourceType, resourceType => resourceType.facilityTypePrices, {
    eager: true,
  })
  @JoinColumn({
    name: 'resource_type_id'
  })
  resourceType: ResourceType;
}