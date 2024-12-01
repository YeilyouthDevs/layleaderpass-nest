import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { NodeEnv } from 'src/enums/node-env.enum';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor(private readonly configService: ConfigService) {
        const PREFIX = process.env.NODE_ENV === NodeEnv.DEVELOPMENT ? 'DEV_' : '';

        this.client = new Redis({
            host: this.configService.get(`${PREFIX}REDIS_HOST`),
            port: this.configService.get(`${PREFIX}REDIS_PORT`),
            password: this.configService.get(`${PREFIX}REDIS_PASS`),
            db: this.configService.get(`${PREFIX}REDIS_DB`)
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }

    // Redis 명령 실행 메서드
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl); // TTL이 설정된 키
        } else {
            await this.client.set(key, value); // 기본 키 설정
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        return this.client.keys(pattern);
    }

    async ttl(key: string) : Promise<number> {
        return this.client.ttl(key);
    }
    
    // 모듈 종료 시 Redis 연결 해제
    onModuleDestroy() {
        this.client.quit();
    }

    // 키 생성 --------------------

    genVerificationCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = 6;
        let code = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }

        return code;
    }

    genRegisterVerifyCodeKey(email: string): string {
        return `reg-vcode:${email}`
    }

}
