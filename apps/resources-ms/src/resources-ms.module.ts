import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/configuration';
import * as path from 'path';

import { ResourcesMsController } from './resources-ms.controller';
import { ResourcesMsService } from './resources-ms.service';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
    }),
  ],
  controllers: [ResourcesMsController],
  providers: [ResourcesMsService],
})
export class ResourcesMsModule {}
