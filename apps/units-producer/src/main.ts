import { NestFactory } from '@nestjs/core';
import { UnitsProducerModule } from './units-producer.module';

async function bootstrap() {
  const app = await NestFactory.create(UnitsProducerModule);
  await app.listen(3002);
}
bootstrap();
