import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ResourcesMsModule } from './resources-ms.module';

// To know more about microservices with NestJS -> https://docs.nestjs.com/microservices/basics
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ResourcesMsModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'resources-ms',
        port: 3004,
      },
    },
  );

  app.listen(() => null);
}

bootstrap();
