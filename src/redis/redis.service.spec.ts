import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

describe('RedisService', () => {
    let redisService: RedisService;
    let mockConfigService: {
        get: jest.Mock;
    };

    beforeEach(async () => {
        mockConfigService = {
            get: jest.fn().mockImplementation((key: string) => {
                const mockConfig = {
                    DEV_REDIS_HOST: 'localhost',
                    DEV_REDIS_PORT: 6379,
                    DEV_REDIS_PASS: 'password',
                    DEV_REDIS_DB: 0,
                };
                return mockConfig[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        redisService = module.get<RedisService>(RedisService);
    });

    it('서비스가 정의되어 있어야 함', () => {
        expect(redisService).toBeDefined();
    });

    afterEach(async () => {
        await redisService.disconnect(); // Redis 연결 해제
    });
});
