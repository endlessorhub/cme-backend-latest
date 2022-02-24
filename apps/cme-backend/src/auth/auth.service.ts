import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private logger: Logger = new Logger('AuthService');


  async validateUser(username: string, pass: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOneByUsername(username);

    if (user && (await bcrypt.compare(pass, user.password)) && user.email_confirmed) {
      return _.omit(user, 'password');
    } else {
      throw new HttpException("Email not existing or not confirmed, please confirm before login", 401);
    }
  }

  async login(user: User) {
    const { username, id: sub } = user;
    return {
      access_token: this.jwtService.sign({ username, sub }),
    };
  }

  async validateToken(token: string) {

    const user = await this.userRepository.findOneByToken(decodeURI(token));

    if(user) {
      if(user.email_confirmed) { //Already confirmed email
        return {
          email_validation: "Email already confirmed, you can login",
        };
      } else {
         //Not confirmed
        this.userRepository.updateUserEmailVerified(user);
        return {
          email_validation: "Email confirmed, you can now login",
        };
      }
    } else {
       //Token not existing
      return {
        email_validation: "Token is not valid, please verify the link or request for a new token",
      };
    }

    
  }

}
