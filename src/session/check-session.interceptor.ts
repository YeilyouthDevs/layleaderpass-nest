import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SessionService } from 'src/session/session.service';
import { CHECK_SESSION_KEY, CheckSessionOptions } from './check-session.decorator';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/http/http.service';
import { Request, Response } from 'express';

@Injectable()
export class CheckSessionInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly sessionService: SessionService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const options: CheckSessionOptions = this.reflector.get<CheckSessionOptions>(
            CHECK_SESSION_KEY,
            context.getHandler(),
        );

        if (!options) {
            return next.handle();
        }

        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        const accessToken = request.headers['access-token'] as string;
        const refreshToken = request.cookies.refreshToken;
        const ipAddress = this.httpService.getIpAddress(request);
        const uuid = request.cookies.uuid;

        try {
            if (accessToken) {
                const isVerified = await this.sessionService.verifyToken(accessToken, this.configService.get('JWT_ACCESS_SECRET')!, {
                    minRole: options.minRole,
                    additionalJob: (decoded: any) => {
                        request.headers.email = decoded.email
                    }
                })

                if (isVerified) return next.handle();
            }

            if (refreshToken && uuid) {

                const isVerified = await this.sessionService.verifyToken(refreshToken, this.configService.get('JWT_REFRESH_SECRET')!, {
                    minRole: options.minRole,
                    additionalJob: async (decoded: any) => {
                        const isRefreshTokenStored = await this.sessionService.isRefreshTokenStored(decoded.email, uuid, refreshToken);
                        if (!isRefreshTokenStored) throw new Error(this.sessionService.messages.SESSION_EXPIRED);

                        const isIpVerified = await this.sessionService.verifyIpAddress(decoded.email, uuid, ipAddress);
                        if (!isIpVerified) throw new Error(this.sessionService.messages.IP_CHANGED);

                        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.sessionService.generateTokens(decoded.email, uuid, ipAddress);
                        response.setHeader('access-token', newAccessToken);

                        const REFRESH_TTL = parseInt(this.configService.get('JWT_REFRESH_TTL')!) * 1000;
                        this.httpService.setCookie(response, 'refreshToken', newRefreshToken, REFRESH_TTL);
                        request.headers.email = decoded.email
                    }
                })

                if (isVerified) return next.handle();
            }

            throw new Error();
        } catch (error) {
            throw new HttpException({ message: error.message || this.sessionService.messages.SESSION_NOT_VALID, needLogin: true }, HttpStatus.UNAUTHORIZED);
        }
    }

}
