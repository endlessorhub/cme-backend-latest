import { IsEmpty } from 'class-validator';

// TODO: the update is not useful for the moment but we
// might need it if the Combat system works asynchronously
export class UpdateAttackDto {
  @IsEmpty()
  attackTime: Date;
}
