import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { NodeEnv } from './enums/node-env.enum';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
        configureSwagger(app);
    }

    // ValidationPipe 설정
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));

    await app.listen(process.env.PORT ?? 3000);
}

function configureSwagger(app: INestApplication) {
    
    if (fs.existsSync('./swagger.json')) {

        // Swagger 설정
        const config = new DocumentBuilder()
            .setTitle("API Documentation")
            .setDescription("API description")
            .setVersion("1.0")
            .build();
        const document = SwaggerModule.createDocument(app, config);

        // Swagger UI 경로 설정
        SwaggerModule.setup("api", app, document);
    }
}

bootstrap();
