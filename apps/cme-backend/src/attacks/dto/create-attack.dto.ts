import { IsEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttackDto {
  @IsEmpty()
  id: number;

  @IsEmpty()
  attackTime: Date;

  @ApiProperty({
    description: 'The id of the village attacking',
  })
  attackerVillageId: number;

  @ApiProperty({
    description: 'The id of the village that will be attacked',
  })
  defenderVillageId: number;

  @ApiProperty({
    description: 'The list of unit sent, described as a json object',
  })
  unitSent: Record<string, any>;
}
