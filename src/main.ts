import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  morgan.token('ip', (req: Request) => {
    const forwarded = req.headers['x-forwarded-for'];
    // If it's an array, take the first string; otherwise use req.ip
    return typeof forwarded === 'string' ? forwarded : (req.ip || 'unknown');
  });

  morgan.token('local', () => {
    return new Date().toLocaleString();
  });

  app.use(
    morgan('\nHTTP Log = ":method :url" :status :response-time ms - :user-agent - :ip - :local')
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();