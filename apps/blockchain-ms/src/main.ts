import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { BlockchainMsModule } from './blockchain-ms.module';

// To know more about microservices with NestJS -> https://docs.nestjs.com/microservices/basics
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BlockchainMsModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'blockchain-ms',
        port: 3005,
      },
    },
  );

  app.listen(() => null);
}

bootstrap();
