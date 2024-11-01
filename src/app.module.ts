import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseInitService } from './database-init.service';
import { User } from './features/user/user.model';
import { NodeEnv } from './enums/node-env.enum copy';
import { UserModule } from './features/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const DEV_PREFIX = process.env.NODE_ENV === NodeEnv.DEVELOPMENT ? 'DEV_' : '';
                
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
        UserModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        DatabaseInitService
    ],
})
export class AppModule { }
