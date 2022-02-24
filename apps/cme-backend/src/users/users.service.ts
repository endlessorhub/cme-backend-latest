import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository) private readonly usersRepository: UserRepository,
  ) {
    //
  }

  async create(user: CreateUserDto): Promise<User> {
    user.password = await bcrypt.hash(user.password, 10);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    // todo:
    //  soft delete
    //  validation
    //  don't remove yourself
    await this.usersRepository.delete(id);
  }
}

