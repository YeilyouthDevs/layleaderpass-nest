import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { RedisModule } from "src/redis/redis.module";
import { MailModule } from "src/mail/mail.module";

@Module({
    imports: [SequelizeModule.forFeature([User]),
        RedisModule,
        MailModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule { }