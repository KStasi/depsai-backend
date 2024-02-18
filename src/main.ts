import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const domain = configService.get<string>('DOMAIN');
  const port = configService.get<string>('PORT');

  await app.listen(port, () => {
    if (domain === 'localhost') {
      console.log(`Server running at http://${domain}:${port}`);
    } else {
      console.log(`Server running at https://${domain}`);
    }
  });
}
bootstrap();
