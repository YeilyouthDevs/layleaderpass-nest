// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [RedisService],
    exports: [RedisService], // 다른 모듈에서 사용 가능하도록 내보냄
})
export class RedisModule {}
