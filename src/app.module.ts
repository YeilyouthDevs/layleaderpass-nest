import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.model';
import { DatabaseInitService } from './database-init.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const DEV_PREFIX = process.env.NODE_ENV === 'development' ? 'DEV_' : '';
                
                return {
                    dialect: 'postgres',
                    host: configService.get(`${DEV_PREFIX}DB_HOST`),
                    port: configService.get(`${DEV_PREFIX}DB_PORT`),
                    username: configService.get(`${DEV_PREFIX}DB_USERNAME`),
                    password: configService.get(`${DEV_PREFIX}DB_PASSWORD`),
                    database: configService.get(`${DEV_PREFIX}DB_DATABASE`),
                    autoLoadModels: true,
                    models: [User],
                }
            }
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        DatabaseInitService
    ],
})
export class AppModule { }
