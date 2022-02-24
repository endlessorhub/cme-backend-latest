import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository) private readonly usersRepository: UserRepository,
    private mailService: MailService,
  ) {
    //
  }

  async create(user: CreateUserDto): Promise<User> {
    user.email_verification_token = encodeURI(await bcrypt.hash(user.username+""+user.password, 10));
    user.password = await bcrypt.hash(user.password, 10);

    //sending verification email
    this.mailService.sendVerificationEmail(user);

    return this.usersRepository.save(user);
  }

  async get(username: string) {

    return this.usersRepository.findOneByUsername(username);
  }

  async remove(id: string): Promise<void> {
    // todo:
    //  soft delete
    //  validation
    //  don't remove yourself
    await this.usersRepository.delete(id);
  }
}

