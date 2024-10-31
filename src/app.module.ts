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
                const dev_prefix = process.env.NODE_ENV === 'development' ? 'DEV_' : '';
                
                return {
                    dialect: 'postgres',
                    host: configService.get(`${dev_prefix}DB_HOST`),
                    port: configService.get(`${dev_prefix}DB_PORT`),
                    username: configService.get(`${dev_prefix}DB_USERNAME`),
                    password: configService.get(`${dev_prefix}DB_PASSWORD`),
                    database: configService.get(`${dev_prefix}DB_DATABASE`),
                    autoLoadModels: true,
                    synchronize: true,
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
