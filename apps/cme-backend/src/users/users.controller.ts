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
import { BadRequestException } from '@nestjs/common';
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

    function validateEmail (emailAdress)
    {
      const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (emailAdress.match(regexEmail)) {
        return true; 
      } else {
        return false; 
      }
    }
    
    if(validateEmail(user.username)){
      return this.usersService.create(user);
    } else {
      throw new BadRequestException('Username must be an email');
    }
  }
}
