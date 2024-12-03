import { Body, Controller, Delete, HttpException, HttpStatus, Post, Put, Query, Req, Res } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoginDTO } from './dto/login.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/http/http.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.model';

@Controller('session')
export class SessionController {

    constructor(
        private readonly sessionService: SessionService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly userService: UserService
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDTO, @Res() res: Response) {

        const { email, password } = loginDto;

        const { user, result: isLoginSuccess } = await this.sessionService.checkEmailAndPassword(email, password);
        if (!isLoginSuccess) throw new HttpException({ message: '이메일 또는 비밀번호를 다시 확인해주세요.' }, HttpStatus.BAD_REQUEST);

        const ipAddress = res.req.ip || 'undefined';
        const { accessToken, refreshToken } = await this.sessionService.generateTokens(email, ipAddress);

        const REFRESH_TTL = this.configService.get('JWT_REFRESH_TTL');

        this.httpService.setCookie(res, 'refreshToken', refreshToken, parseInt(REFRESH_TTL.slice(0, -1)) * 1000)
        .json({
            accessToken,
            name: user?.name
        });
    }

    @Delete('logout')
    async logout(@Query('email') email: string, @Req() req: Request, @Res() res: Response) {
        if (!email) {
            throw new HttpException('요청이 잘못되었습니다.', HttpStatus.BAD_REQUEST);
        }
    
        const refreshToken = req.cookies?.refreshToken;
    
        if (refreshToken) {
            await this.sessionService.deleteRefreshToken(email, refreshToken);    
        }
    
        this.httpService.setCookie(res, 'refreshToken', '', 0).end();
    }

    @Put('refresh')
    async refresh(@Body() body: { email: string, accessToken: string }, @Req() req: Request, @Res() res: Response) {

        const { email, accessToken } = body;
        const refreshToken = req.cookies.refreshToken;
        const ipAddress = req.ip || 'undefined';

        if (!email && !accessToken && !refreshToken) return res.status(200).send();

        console.log(`email: ${email}, accessToken: ${accessToken}, refreshToken: ${refreshToken}, ip: ${ipAddress}`)
    
        if (!refreshToken) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: '장시간 활동이 없어 로그아웃 되었습니다.',
                needLogin: true,
            });
            return;
        }
    
        const result = await this.sessionService.refreshTokens(email, accessToken, refreshToken, ipAddress);
    
        if (!result.success) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: result.message,
                needLogin: result.needLogin,
            });
            return;
        }
    
        const REFRESH_TTL = this.configService.get('JWT_REFRESH_TTL');
        let user: User | null = null;

        if (!accessToken) {
            user = await this.userService.findUserByEmail(result.email);
            if (!user) throw new Error('사용자를 찾을 수 없음');
        }

        this.httpService.setCookie(res, 'refreshToken', result.refreshToken, parseInt(REFRESH_TTL.slice(0, -1)) * 1000)
        .json({
            accessToken: result.accessToken,
            email: result.email,
            name: user?.name || undefined
        });
    }
    
}
