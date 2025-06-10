import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

void (async () => {
  const httpApp = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('LiveChat API')
    .setDescription('유튜브 클론 실시간 채팅 API 명세서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(httpApp, config);
  SwaggerModule.setup('swagger', httpApp, document);
  httpApp.useGlobalInterceptors(new LoggingInterceptor());
  httpApp.useGlobalPipes(new ValidationPipe());
  httpApp.enableShutdownHooks();
  await httpApp.listen(3000);
})();
