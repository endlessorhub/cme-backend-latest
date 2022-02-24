import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {

    function validateEmail (emailAdress)
    {
      const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (emailAdress.match(regexEmail)) {
        return true; 
      } else {
        return false; 
      }
    }

    if(validateEmail(username)){
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } else {
      throw new BadRequestException('Login must be done with email');
    }
  }
}