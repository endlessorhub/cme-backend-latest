import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Village } from '../villages/village.entity';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Village])],
  providers: [PublicService],
  controllers: [PublicController],
})
export class PublicModule {}
