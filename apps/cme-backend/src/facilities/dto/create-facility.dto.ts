import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNumber } from 'class-validator';
import { Village } from '../../villages/village.entity';
import { FacilityType } from '../../facility-types/facility-type.entity';
import { Exclude } from 'class-transformer';

export class CreateFacilityDto {
    @IsEmpty()
    id: number;

    @Exclude()
    readonly level: number = 1;

    @ApiProperty()
    @IsNumber()
    facilityType: FacilityType;
    @ApiProperty()
    @IsNumber()
    location: number;
    @ApiProperty()
    @IsNumber()
    village: Village;
}