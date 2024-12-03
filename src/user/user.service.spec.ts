import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { RedisService } from 'src/redis/redis.service';
import { MailService } from 'src/mail/mail.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './user.model';
import { RateLimitExceededException } from 'src/exceptions/rate-limit-exceed.exception';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
    let service: UserService;
    let mockUserModel: {
        create: jest.Mock;
        findOne: jest.Mock;
    };
    let mockRedisService: {
        get: jest.Mock;
        set: jest.Mock;
        ttl: jest.Mock;
        del: jest.Mock;
        genVerificationCode: jest.Mock;
        genRegisterVerifyCodeKey: jest.Mock;
    };
    let mockMailService: {
        sendMail: jest.Mock;
    };

    beforeEach(async () => {
        mockUserModel = {
            create: jest.fn(),
            findOne: jest.fn(),
        };

        mockRedisService = {
            get: jest.fn(),
            set: jest.fn(),
            ttl: jest.fn(),
            del: jest.fn(),
            genVerificationCode: jest.fn(),
            genRegisterVerifyCodeKey: jest.fn(),
        };

        mockMailService = {
            sendMail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User),
                    useValue: mockUserModel,
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    test('서비스가 정의되어 있어야 함', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        test('이미 존재하는 이메일로 사용자 생성 시 에러 발생', async () => {
            mockUserModel.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });

            await expect(
                service.createUser({
                    email: 'test@test.com',
                    password: bcrypt.hashSync('password123', bcrypt.genSaltSync()),
                    name: '홍길동',
                    phone: '01012345678',
                    birthday: new Date('19990101')
                }),
            ).rejects.toThrowError('이미 사용자가 존재해 가입할 수 없습니다.');
        });

        test('새 사용자를 성공적으로 생성', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            mockUserModel.create.mockResolvedValue({ id: 1, email: 'test@test.com' });

            const result = await service.createUser({
                email: 'test@test.com',
                password: bcrypt.hashSync('password123', bcrypt.genSaltSync()),
                name: '홍길동',
                phone: '01012345678',
                birthday: new Date('19990101')
            });

            expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
            expect(mockUserModel.create).toHaveBeenCalled();
            expect(result).toEqual({ id: 1, email: 'test@test.com' });
        });
    });

    describe('getOrGenVerifyCode', () => {
        const email = 'test@test.com';
        const key = `test-key:${email}`;
        const generatedCode = 'ABC123';

        beforeEach(() => {
            mockRedisService.genRegisterVerifyCodeKey.mockReturnValue(key);
            mockRedisService.genVerificationCode.mockReturnValue(generatedCode);
        });

        test('기존 코드가 존재하면 새로 생성하지 않음', async () => {
            mockRedisService.get.mockResolvedValue(generatedCode);
            mockRedisService.ttl.mockResolvedValue(1000);

            const code = await service.getOrGenVerifyCode(email);

            expect(mockRedisService.get).toHaveBeenCalledWith(key);
            expect(mockRedisService.set).not.toHaveBeenCalled();
            expect(code).toEqual(generatedCode);
        });

        test('새 코드를 생성하고 저장', async () => {
            mockRedisService.get.mockResolvedValue(null);
            mockRedisService.ttl.mockResolvedValue(0);

            const code = await service.getOrGenVerifyCode(email);

            expect(mockRedisService.get).toHaveBeenCalledWith(key);
            expect(mockRedisService.set).toHaveBeenCalledWith(key, generatedCode, 60 * 20);
            expect(code).toEqual(generatedCode);
        });

        test('요청 제한 초과 시 RateLimitExceededException 발생', async () => {
            mockRedisService.get.mockResolvedValue('ABC123');
            mockRedisService.ttl.mockResolvedValue(19 * 60); // TTL이 제한 초과를 나타내는 값으로 설정
        
            await expect(service.getOrGenVerifyCode(email)).rejects.toThrowError(RateLimitExceededException);
        });
    });

    describe('checkVerifyCode', () => {
        const email = 'test@test.com';
        const key = `test-key:${email}`;
        const validCode = 'ABC123';

        beforeEach(() => {
            mockRedisService.genRegisterVerifyCodeKey.mockReturnValue(key);
        });

        test('올바른 코드 입력 시 true 반환 및 키 삭제', async () => {
            mockRedisService.get.mockResolvedValue(validCode);

            const result = await service.checkVerifyCode(email, validCode);

            expect(mockRedisService.get).toHaveBeenCalledWith(key);
            expect(mockRedisService.del).toHaveBeenCalledWith(key);
            expect(result).toBe(true);
        });

        test('잘못된 코드 입력 시 false 반환', async () => {
            mockRedisService.get.mockResolvedValue(validCode);

            const result = await service.checkVerifyCode(email, 'WRONGCODE');

            expect(mockRedisService.get).toHaveBeenCalledWith(key);
            expect(mockRedisService.del).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
});
