import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourcesMsService {
  getHello(): string {
    return 'Hello World!';
  }
}
