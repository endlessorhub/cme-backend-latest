import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../public.decorator';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User) private readonly userRepository: UserRepository
  ) {
    //
  }

  // @ApiBearerAuth()
  @Public()
  @Get()
  index() {
    return this.userRepository.findAll();
  }

  // @ApiBearerAuth()
  @Public()
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  show(@Param('id') id: string) {
    return this.userRepository.findOne(id);
  }

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }
}
