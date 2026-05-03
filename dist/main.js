"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') || 3000;
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin ||
                /^http:\/\/localhost(:\d+)?$/.test(origin) ||
                /^http:\/\/(192\.168\.|192\.200\.|10\.|172\.(1[6-9]|2\d|3[01])\.)([\d.]+(:\d+)?)$/.test(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ISP ERP System API')
        .setDescription('API documentation for the Enterprise ISP ERP Web System')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:${port}`);
    try {
        const Database = require('better-sqlite3');
        const db = new Database('isp-erp.sqlite');
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const info = db.prepare(`UPDATE subscriptions SET createdAt = startDate
       WHERE substr(createdAt,1,10) = ? AND substr(startDate,1,10) != ?`).run(todayStr, todayStr);
        if (info.changes > 0) {
            console.log(`[startup] Fixed ${info.changes} corrupted createdAt records`);
        }
        db.close();
    }
    catch (e) {
        console.warn('[startup] createdAt fix skipped:', e.message);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map