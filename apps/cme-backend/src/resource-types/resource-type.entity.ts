import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToMany,
} from 'typeorm';
import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { ResourceTypePrice } from './resource-type-price.entity';
import { FacilityTypePrice } from '../facility-types/facility-type-price.entity';
import { Order } from '../orders/orders.entity';

@Entity({name: 'resource_types'})
@Unique(['type'])
export class ResourceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  industry: string;

  @Column('json')
  characteristics: Record<string,any>;

/*   @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date; */

  @OneToMany(() => FacilityTypeResourceType, facilityTypeResourceType => facilityTypeResourceType.resourceType)
  facilityTypesResourceTypes: FacilityTypeResourceType [];

  @OneToMany(() => VillageResourceType, villageResourceType => villageResourceType.resourceType)
  villagesResourceTypes: VillageResourceType [];

  @OneToMany(() => FacilityTypePrice, facilityTypePrice => facilityTypePrice.resourceType)
  facilityTypePrices: FacilityTypePrice[];

  @OneToMany(() => ResourceTypePrice, resourceTypePrice => resourceTypePrice.targetResourceType)
  targetResourceTypePrices: ResourceTypePrice[];

  @OneToMany(() => ResourceTypePrice, resourceTypePrice => resourceTypePrice.sourceResourceType)
  sourceResourceTypePrices: ResourceTypePrice[];

  @OneToMany(() => Order, order => order.resourceType)
  orders: Order[];
}
