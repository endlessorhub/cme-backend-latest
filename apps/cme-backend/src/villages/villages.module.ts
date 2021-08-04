import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';
import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { AccessControlModule } from 'nest-access-control';
import { roles } from '../app.roles';

@Module({
  imports: [
    TypeOrmModule.forFeature([Village]),
    TypeOrmModule.forFeature([User]),
    AccessControlModule.forRoles(roles)
  ],
  controllers: [VillagesController],
  providers: [VillagesService]
})
export class VillagesModule {}
