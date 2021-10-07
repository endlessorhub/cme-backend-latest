import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Request,
    Query,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { VillagesService } from './villages.service';
import { CreateVillageDto } from './dto/create-village.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { Village } from './village.entity';
import {GetVillagesRectangle} from './../villages-resource-types/village-query-level-stream';

@ApiBearerAuth()
@Controller('villages')
export class VillagesController {
    constructor(
        private villagesService: VillagesService,
        @InjectRolesBuilder()
        private readonly rolesBuilder: RolesBuilder,
    ) {}

    @Get()
    async index(@Request() req,@Query() queryParams : GetVillagesRectangle): Promise<Village[]> {
        const permission = this.rolesBuilder.can(req.user.roles).readAny('village');

        if(queryParams.x1 && queryParams.y1 && queryParams.x2 && queryParams.y2){
            return permission.filter(await this.villagesService.findRectangle(
                queryParams.x1,
                queryParams.y1,
                queryParams.x2,
                queryParams.y2
                )
            );
        } else if(queryParams.x1 && queryParams.y1 && queryParams.offset){
            return permission.filter(await this.villagesService.findAllAround(
                queryParams.x1,
                queryParams.y1,
                queryParams.offset
                )
            );
        } else {
            return permission.filter(await this.villagesService.findAll());
        }
    }

    @Get(':id')
    async show(@Request() req, @Param('id') id: string) {
        const village = await this.villagesService.findOne(id);
        if (village.user.id !== req.user.id) {
            throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
        }
        console.log(village);
        const permission = this.rolesBuilder.can(req.user.roles).readOwn('village');
        return permission.filter(village);
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Request() req, @Body() village: CreateVillageDto) {
        return this.villagesService.create(village, req.user.id);
    }
}

