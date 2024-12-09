import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CheckSession } from './session/check-session.decorator';
import { UserRole } from './enums/user-role.enum';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get('test')
    @CheckSession({ minRole: UserRole.GUEST })
    async test() {
        return 'hello!';
    }

}
