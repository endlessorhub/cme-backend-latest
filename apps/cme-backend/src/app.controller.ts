
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Logger } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './auth/dto/login.dto';
import { ApiBody, ApiProperty } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private authService: AuthService) {}
  private logger: Logger = new Logger('AppController');

  @Public()
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @ApiProperty({
    description: `Basic Auth`,
    example: ['admin/admin'],
  })
  @Post('auth/login')
  async login(@Request() req) {
    this.logger.log(`Login attempt for user: ${req.user.username}`);
    return this.authService.login(req.user);
  }
}