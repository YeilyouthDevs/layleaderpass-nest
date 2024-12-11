import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query, Req, Res } from '@nestjs/common';
import { SessionService } from './session.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/http/http.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { v4 } from 'uuid';

@Controller('session')
export class SessionController {
    constructor(
        private readonly sessionService: SessionService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
        const { email, password } = loginDto;

        // 사용자 존재여부, 비밀번호 일치 확인
        const { user, result: isLoginSuccess } = await this.sessionService.checkEmailAndPassword(email, password, {
            attributes: ['email', 'password', 'name', 'role']
        });
        if (!user || !isLoginSuccess) {
            throw new HttpException({ message: '이메일 또는 비밀번호를 다시 확인해주세요.' }, HttpStatus.BAD_REQUEST);
        }

        // ip주소 획득, 토큰 생성
        const ipAddress = this.httpService.getIpAddress(res.req);
        const uuid = v4();
        const { accessToken, refreshToken } = await this.sessionService.generateTokens(email, uuid, ipAddress);

        res.setHeader('access-token', accessToken);

        // 쿠키와 함께 응답전송
        const REFRESH_TTL = parseInt(this.configService.get('JWT_REFRESH_TTL')!) * 1000;
        this.httpService.setCookie(res, 'refreshToken', refreshToken, REFRESH_TTL)
        return this.httpService.setCookie(res, 'uuid', uuid, REFRESH_TTL).json({
            name: user.name,
            role: user.role
        });
    }

    @Delete('logout')
    async logout(@Query('email') email: string, @Req() req: Request, @Res() res: Response) {
        if (!email) {
            throw new HttpException('요청이 잘못되었습니다.', HttpStatus.BAD_REQUEST);
        }

        const refreshToken = req.cookies?.refreshToken;
        const uuid = req.cookies?.uuid;

        if (refreshToken) {
            await this.sessionService.deleteRefreshToken(email, uuid);
        }

        this.httpService.setCookie(res, 'refreshToken', '', 0);
        return this.httpService.setCookie(res, 'uuid', '', 0).end();
    }


    @Put('refresh')
    async refresh(@Body() body: { email: string }, @Req() req: Request, @Res() res: Response) {
        const accessToken = req.headers['access-token'];
        const refreshToken = req.cookies.refreshToken;
        const uuid = req.cookies.uuid;
        const ipAddress = this.httpService.getIpAddress(req);

        if (!body.email && !accessToken && !refreshToken) {
            return res.status(200).send();
        }

        try {
            if (!refreshToken || !uuid) {
                throw new Error(this.sessionService.messages.SESSION_NOT_VALID);
            }

            const decoded = await this.jwtService.verifyAsync(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') }).catch(() => null);
            if (!decoded) throw new Error(this.sessionService.messages.BAD_REQUEST);

            const email = body.email || decoded.email;

            const isRefreshTokenStored = await this.sessionService.isRefreshTokenStored(email, uuid, refreshToken);
            if (!isRefreshTokenStored) throw new Error(this.sessionService.messages.SESSION_EXPIRED);

            const isIpVerified = await this.sessionService.verifyIpAddress(decoded.email, uuid, ipAddress);
            if (!isIpVerified) throw new Error(this.sessionService.messages.IP_CHANGED);

            const user = await this.userService.findUserByEmail(email, { attributes: ['email', 'name', 'role'] })
            if (!user) throw new Error(this.sessionService.messages.USER_NOT_FOUND);

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.sessionService.generateTokens(email, uuid, ipAddress);
            res.setHeader('access-token', newAccessToken);

            const REFRESH_TTL = parseInt(this.configService.get('JWT_REFRESH_TTL')!) * 1000;
            this.httpService.setCookie(res, 'refreshToken', newRefreshToken, REFRESH_TTL)
            return this.httpService.setCookie(res, 'uuid', uuid, REFRESH_TTL).json({
                email: user.email,
                name: user.name,
                role: user.role
            })
        } catch (error) {
            this.httpService.setCookie(res, 'refreshToken', '', 0);
            this.httpService.setCookie(res, 'uuid', '', 0);
            throw new HttpException({ message: error.message || this.sessionService.messages.SESSION_NOT_VALID, needLogin: true }, HttpStatus.BAD_REQUEST);
        }

    }
}
