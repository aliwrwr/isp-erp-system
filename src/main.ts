import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('port') || process.env.PORT || 3000);

  // Increase body size limit to handle base64 logo images
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  const frontendOrigin = process.env.FRONTEND_URL;
  const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
  const lanRegex = /^http:\/\/(192\.168\.|192\.200\.|10\.|172\.(1[6-9]|2\d|3[01])\.)([\d.]+(:\d+)?)$/i;
  const vercelRegex = /^https:\/\/.*\.vercel\.app$/i;

  // Enable CORS for local development and deployed frontend domains
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (frontendOrigin && origin === frontendOrigin) {
        callback(null, true);
        return;
      }

      if (
        localhostRegex.test(origin) ||
        lanRegex.test(origin) ||
        vercelRegex.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('ISP ERP System API')
    .setDescription('API documentation for the Enterprise ISP ERP Web System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);

  // ── Fix corrupted createdAt values (one-time migration fix) ──────
  // TypeORM synchronize:true set ALL existing rows to CURRENT_TIMESTAMP
  // when it added the createdAt column. We fix: if createdAt date = today
  // but startDate date != today → it's a migrated artifact → set createdAt = startDate
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const db = new Database('isp-erp.sqlite');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const info = db.prepare(
      `UPDATE subscriptions SET createdAt = startDate
       WHERE substr(createdAt,1,10) = ? AND substr(startDate,1,10) != ?`
    ).run(todayStr, todayStr);
    if (info.changes > 0) {
      console.log(`[startup] Fixed ${info.changes} corrupted createdAt records`);
    }
    db.close();
  } catch (e) {
    console.warn('[startup] createdAt fix skipped:', (e as Error).message);
  }
}
bootstrap();
