import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityTypePrice } from './facility-type-price.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([FacilityTypePrice]),
    ],
})
export class FacilityTypePricesModule {}
