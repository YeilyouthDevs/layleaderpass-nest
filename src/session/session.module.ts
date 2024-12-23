import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        UserModule
    ],
    providers: [SessionService],
    controllers: [SessionController],
    exports: [SessionService]
})
export class SessionModule { }
