import { IsEmpty, IsOptional, IsString } from 'class-validator';
import { Village } from '../../villages/village.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsEmpty()
    id: number;

    @IsEmpty()
    role: string;

    @IsEmpty()
    villages: Village[];

    @IsOptional()
    ethWalletAddresses: Record<string, any>;

    @IsOptional()
    email: string;

    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    password: string;
}
