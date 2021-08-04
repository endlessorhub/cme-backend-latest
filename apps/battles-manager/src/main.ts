import { NestFactory } from '@nestjs/core';
import { BattlesManagerModule } from './battles-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(BattlesManagerModule);
  await app.listen(3003);
}
bootstrap();
