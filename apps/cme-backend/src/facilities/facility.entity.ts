import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Village } from '../villages/village.entity';
import { FacilityType } from '../facility-types/facility-type.entity';
import { Order } from '../orders/orders.entity';

@Entity({ name: 'facilities' })
@Unique(['village', 'location'])
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  location: number;

  @Column({
    name: 'last_production_at',
  })
  lastProductionAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'is_in_production',
  })
  isInProduction: boolean;

  @ManyToOne(() => FacilityType, (facilityType) => facilityType.facilities, {
    eager: true,
  })
  @JoinColumn({
    name: 'facility_type_id',
  })
  facilityType: FacilityType;

  @ManyToOne(() => Village, (village) => village.facilities, {
    eager: true,
  })
  @JoinColumn({
    name: 'village_id',
  })
  village: Village;

  @OneToMany(() => Order, (order) => order.facility)
  orders: Order[];
}
