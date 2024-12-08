import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseInitService } from './database-init.service';
import { User } from './user/user.model';
import { NodeEnv } from './enums/node-env.enum';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SessionService } from './session/session.service';
import { SessionController } from './session/session.controller';
import { SessionModule } from './session/session.module';
import { JwtModule } from '@nestjs/jwt';
import { HttpService } from './http/http.service';
import { HttpModule } from './http/http.module';
import { TrainingType } from './training-type/training-type.model';
import { Training } from './training/training.model';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CheckSessionInterceptor } from './session/check-session.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const PREFIX = process.env.NODE_ENV === NodeEnv.DEVELOPMENT ? 'DEV_' : '';
                
                return {
                    dialect: 'postgres',
                    host: configService.get(`${PREFIX}DB_HOST`),
                    port: configService.get(`${PREFIX}DB_PORT`),
                    username: configService.get(`${PREFIX}DB_USERNAME`),
                    password: configService.get(`${PREFIX}DB_PASSWORD`),
                    database: configService.get(`${PREFIX}DB_DATABASE`),
                    autoLoadModels: true,
                    models: [
                        User,
                        TrainingType,
                        Training
                    ],
                }
            }
        }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), (process.env.NODE_ENV === NodeEnv.PRODUCTION) ? 'layleaderpass/build' : 'build'),
            exclude: ['/api*']
        }),
        JwtModule.register({
            global: true
        }),
        UserModule,
        MailModule,
        RedisModule,
        SessionModule,
        HttpModule,
    ],
    controllers: [AppController, SessionController],
    providers: [
        AppService,
        DatabaseInitService,
        SessionService,
        HttpService,
        { provide: APP_INTERCEPTOR, useClass: CheckSessionInterceptor }
    ],
})
export class AppModule { }
