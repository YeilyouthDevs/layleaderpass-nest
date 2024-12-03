import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';

type RefreshTokensResult =
| { success: true; accessToken: string; refreshToken: string, email: string }
| { success: false; message: string; needLogin: boolean };

@Injectable()
export class SessionService {

    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly redisService: RedisService, private readonly userService: UserService) { }

    async checkEmailAndPassword(userEmail: string, password: string) {
        const foundUser = await this.userService.findUserByEmail(userEmail);

        return {
            user: foundUser,
            result: (foundUser) ? bcrypt.compareSync(password, foundUser.password) : false
        } 
    }

    async generateTokens(userEmail: string, ipAddress: string) {
        const ACCESS_TTL = this.configService.get('JWT_ACCESS_TTL');
        const REFRESH_TTL = this.configService.get('JWT_REFRESH_TTL');
        const MAX_SESSION_CNT = this.configService.get('MAX_SESSION_CNT');

        const accessToken = await this.jwtService.signAsync(
            { email: userEmail },
            {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: ACCESS_TTL
            }
        );

        const refreshToken = await this.jwtService.signAsync(
            { email: userEmail },
            {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: REFRESH_TTL
            }
        );

        await this.redisService.set(
            this.redisService.genRefreshTokenKey(userEmail, refreshToken),
            ipAddress,
            parseInt(REFRESH_TTL.slice(0, -1)),
        );

        await this.redisService.maintainKeyCount(this.redisService.genRefreshTokenKey(userEmail), MAX_SESSION_CNT)

        return { accessToken, refreshToken }
    }

    async refreshTokens(email: string, accessToken: string | null, refreshToken: string, ipAddress: string): Promise<RefreshTokensResult> {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        }).catch(() => null);

        console.log(`decoded email: ${decoded.email}`)
    
        if (!decoded || (email && decoded.email !== email)) {
            return { success: false, message: '올바르지 않은 요청입니다.', needLogin: true };
        }
    
        if (!accessToken) {
            const prevIpAddress = await this.redisService.get(this.redisService.genRefreshTokenKey(email || decoded.email, refreshToken));
            console.log(`prev ip: ${prevIpAddress}`)

            if (!prevIpAddress || prevIpAddress !== ipAddress) {
                return { success: false, message: '접속중인 IP 주소가 변경되어 로그인이 필요합니다. 계정 보안을 위해 양해 부탁드립니다.', needLogin: true };
            }
        }
    
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.generateTokens(email || decoded.email, ipAddress);
        return { success: true, accessToken: newAccessToken, refreshToken: newRefreshToken, email: email || decoded.email };
    }
    
    async deleteRefreshToken(userEmail: string, refreshToken: string) {
        await this.redisService.del(this.redisService.genRefreshTokenKey(userEmail, refreshToken));
    }

    async hashRefreshToken(refreshToken: string) {
        return await bcrypt.hash(refreshToken, 10);
    }

    async verifyRefreshToken(refreshToken: string, hashedToken: string) {
        return await bcrypt.compare(refreshToken, hashedToken);
    }
}
