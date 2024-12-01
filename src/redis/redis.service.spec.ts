import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await service.disconnect(); // Ensure you have a disconnect method in your RedisService
  });

  test('서비스가 정의되어 있어야 함', () => {
    expect(service).toBeDefined();
  });
});
