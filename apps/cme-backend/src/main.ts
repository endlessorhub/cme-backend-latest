import 'source-map-support/register';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CmeAuthGuard } from './auth/cme-auth.guard';
import { RedisIoAdapter } from './redis-io.adapter';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CmeAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor());

  const options = new DocumentBuilder()
    .setTitle('ME API')
    .setDescription('Monkey Empire API')
    .setVersion('1.0')
    .addTag('me')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
