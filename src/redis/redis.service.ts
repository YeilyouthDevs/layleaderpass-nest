import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor() {
        //TODO Redis 접속 정보 환경변수로 옮기기
        this.client = new Redis({
            host: 'localhost', // Redis 호스트
            port: 6379, // Redis 포트
            password: '', // Redis 비밀번호 (필요한 경우)
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
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
}
