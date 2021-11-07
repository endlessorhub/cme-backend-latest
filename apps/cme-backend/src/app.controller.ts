
import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './auth/dto/login.dto';
import { ApiBody, ApiProperty } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @ApiProperty({
    description: `Basic Auth`,
    example: ['admin/admin'],
  })
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}