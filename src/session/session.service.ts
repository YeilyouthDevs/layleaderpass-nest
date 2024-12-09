import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/enums/user-role.enum';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly userService: UserService,
    ) { }

    messages = {
        SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인 해주세요.',
        BAD_REQUEST: '올바른 접근이 아닙니다.',
        USER_NOT_FOUND: '사용자를 찾을 수 없습니다. 일시적이거나 계정이 삭제되었을 수 있습니다. 다시 로그인 해주세요.',
        IP_CHANGED: '접속중인 IP가 변경되어 로그인이 필요합니다.',
        SESSION_NOT_VALID: '세션이 올바르지 않습니다. 다시 로그인 해주세요.',

    }

    async checkEmailAndPassword(userEmail: string, password: string) {
        const foundUser = await this.userService.findUserByEmail(userEmail);
        if (!foundUser) return { result: false };

        return {
            user: foundUser,
            result: await bcrypt.compare(password, foundUser.password),
        };
    }

    async generateTokens(email: string, uuid: string, ipAddress: string): Promise<{ accessToken: string; refreshToken: string; }> {
        const ACCESS_TTL = parseInt(this.configService.get('JWT_ACCESS_TTL')!) ;
        const REFRESH_TTL = parseInt(this.configService.get('JWT_REFRESH_TTL')!);
        const MAX_SESSION_CNT = parseInt(this.configService.get('MAX_SESSION_CNT')!);

        const accessToken = await this.jwtService.signAsync(
            { email },
            { secret: this.configService.get('JWT_ACCESS_SECRET'), expiresIn: ACCESS_TTL },
        );

        const refreshToken = await this.jwtService.signAsync(
            { email },
            { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: REFRESH_TTL },
        );

        await this.storeSessionInRedis(email, uuid, refreshToken, ipAddress, REFRESH_TTL, MAX_SESSION_CNT);

        return { accessToken, refreshToken };
    }

    private async storeSessionInRedis(email: string, uuid: string, refreshToken: string, ipAddress: string, refreshTTL: number, maxSessionCount: number) {
        await this.redisService.set(
            this.redisService.genRefreshTokenKey(email, uuid), `${ipAddress}/${refreshToken}`, refreshTTL);

        await this.redisService.maintainKeyCount(this.redisService.genRefreshTokenKey(email), maxSessionCount);
    }

    async deleteRefreshToken(email: string, uuid: string) {
        await this.redisService.del(this.redisService.genRefreshTokenKey(email, uuid));
    }

    async getStoredSessionData(email: string, uuid: string) {
        const stored = await this.redisService.get(this.redisService.genRefreshTokenKey(email, uuid));
        if (!stored) return null;

        const [ ipAddress, refreshToken ] = stored.split('/');
        return { ipAddress, refreshToken };
    }

    async isRefreshTokenStored(email: string, uuid: string, refreshToken: string) {
        const stored = await this.getStoredSessionData(email, uuid);
        if (!stored) return false;

        if (stored.refreshToken !== refreshToken) return false;
        return true;
    }

    async verifyIpAddress(email: string, uuid: string, ipAddress: string) {
        const stored = await this.getStoredSessionData(email, uuid);
        if (!stored) return false

        return stored.ipAddress === ipAddress
    }

    async checkValidUser(email: string, options?: { minRole?: UserRole }) {
        const user = await this.userService.findUserByEmail(email, {
            attributes: ['email', 'role']
        });

        if (!user) return null;

        if (options?.minRole) {
            if (user.role < options.minRole) return null;
        }

        return user;
    }

    async verifyToken(token: string, secret: string, options?: { minRole?: UserRole, additionalJob?: CallableFunction }) {
        const decoded = await this.jwtService.verifyAsync(token, { secret }).catch(() => null);

        if (decoded) {
            const user = await this.checkValidUser(decoded.email, { minRole: options?.minRole });
            if (!user) throw new Error(this.messages.USER_NOT_FOUND);
    
            if (options?.additionalJob) await options.additionalJob(decoded);
            
            return true;
        }
    
        return false;
    }
}
