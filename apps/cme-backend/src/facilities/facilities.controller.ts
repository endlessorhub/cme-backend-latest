import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service'
import { CreateFacilityDto } from './dto/create-facility.dto';

@ApiBearerAuth()
@Controller('facilities')
export class FacilitiesController {
    constructor(private facilitiesService: FacilitiesService) {}

    @Get()
    index() {
        return this.facilitiesService.findAll();
    }

    @Get(':id')
    show(@Param('id') id: string) {
        return this.facilitiesService.findOne(id)
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() facility: CreateFacilityDto) {
        return this.facilitiesService.create(facility);
    }
}
