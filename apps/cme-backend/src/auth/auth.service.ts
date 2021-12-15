import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password)))
      return _.omit(user, 'password');
  }

  async login(user: User) {
    const { username, id: sub } = user;
    return {
      access_token: this.jwtService.sign({ username, sub }),
    };
  }
}
