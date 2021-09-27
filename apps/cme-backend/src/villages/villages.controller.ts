import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Request,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { VillagesService } from './villages.service';
import { CreateVillageDto } from './dto/create-village.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { Village } from './village.entity';

@ApiBearerAuth()
@Controller('villages')
export class VillagesController {
    constructor(
        private villagesService: VillagesService,
        @InjectRolesBuilder()
        private readonly rolesBuilder: RolesBuilder,
    ) {}

    @Get()
    async index(@Request() req): Promise<Village[]> {
        const permission = this.rolesBuilder.can(req.user.roles).readAny('village');
        return permission.filter(await this.villagesService.findAll());
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

    @Get(':x/:y/:offset')
    async showAround(@Request() req, @Param('x') xCam: number, @Param('y') yCam: number, @Param('offset') radius : number) {
        const permission = this.rolesBuilder.can(req.user.roles).readAny('village');
        
        return permission.filter(await this.villagesService.findAllAround(xCam,yCam,radius));
    }

    @Get(':x1/:y1/:x2/:y2')
    async showVillagesRectangle(@Request() req, @Param('x1') x1: number, @Param('y1') y1: number, @Param('x2') x2 : number, @Param('y2') y2 : number) {
        const permission = this.rolesBuilder.can(req.user.roles).readAny('village');
        
        return permission.filter(await this.villagesService.findRectangle(x1,y1,x2,y2));
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Request() req, @Body() village: CreateVillageDto) {
        return this.villagesService.create(village, req.user.id);
    }
}
