import { IsEmpty, IsOptional, IsString } from 'class-validator';
import { Village } from '../../villages/village.entity';
import { ApiProperty } from '@nestjs/swagger';

import { IsEmail } from "class-validator";

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
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    password: string;

    email_verification_token: string;

    

}
