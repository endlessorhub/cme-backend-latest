import { IsEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DevTravelTimeMode {
  DEFAULT = 'DEFAULT',
  HOURS_AS_MINUTES = 'HOURS_AS_MINUTES',
  INSTANT = 'INSTANT',
}

class AttackDevConfig {
  @ApiProperty({
    description:
      'A string helping you have faster travel times during attacks. Possible values: `DEFAULT`, `HOURS_AS_MINUTES`, `INSTANT`, instant being the fastest way, and default being the same behaviour than production',
  })
  attackTimeMode: DevTravelTimeMode;
}

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

  @ApiProperty({
    description: 'Dev config',
  })
  devConfig: AttackDevConfig;
}
