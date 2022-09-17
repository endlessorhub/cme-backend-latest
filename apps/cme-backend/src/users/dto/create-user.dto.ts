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
  ethWalletAddresses: string;

  @IsOptional()
  ethPrivateKey: string;

  @IsOptional()
  derive: number;

  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}
