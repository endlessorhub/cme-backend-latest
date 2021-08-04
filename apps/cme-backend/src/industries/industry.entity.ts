import { FacilityType } from '../facility-types/facility-type.entity';
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
import { Facility} from "../facilities/facility.entity";
import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';
import { FacilityTypePrice } from '../facility-types/facility-type-price.entity';

@Entity({name: 'industries'})
@Unique(['name'])
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => FacilityType, facilityType => facilityType.industry)
  facilityTypes: FacilityType[]
}
