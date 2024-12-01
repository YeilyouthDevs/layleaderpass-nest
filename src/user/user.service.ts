import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { CreateUserDTO } from "./dto/create-user.dto";
import { RedisService } from "src/redis/redis.service";
import { RateLimitExceededException } from "src/exceptions/rate-limit-exceed.exception";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private readonly userModel: typeof User,
        private readonly redisService: RedisService,
    ) { }

    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        const user = await this.findUserByEmail(createUserDTO.email);
        if (user) throw new Error('이미 사용자가 존재해 가입할 수 없습니다.');

        createUserDTO.password = bcrypt.hashSync(createUserDTO.password, bcrypt.genSaltSync());
        return this.userModel.create(createUserDTO as User);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ where: { email } }); // 이메일로 사용자 검색
    }

    generateVerificationCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = 6;
        let code = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }

        return code;
    }

    async getOrGenVerifyCode(email: string): Promise<string> {
        const TTL = 60 * 20; // 20분
        const RATE_LIMIT_THRESHOLD = 60 * 1; // 1분 제한
        const verifyCodeKey = `register-verify-code:${email}`;
    
        // 기존 코드 및 TTL 확인
        const code = await this.redisService.get(verifyCodeKey);
        const ttl = await this.redisService.ttl(verifyCodeKey);
    
        // TTL 확인하여 제한 여부 판단
        if (ttl > 0 && ttl >= TTL - RATE_LIMIT_THRESHOLD) {
            // RATE_LIMIT_THRESHOLD(2분) 이내에 요청한 경우 제한
            throw new RateLimitExceededException();
        }
    
        // 새 코드 생성 및 TTL 설정
        const newCode = code ?? this.generateVerificationCode();
        if (!code) {
            await this.redisService.set(verifyCodeKey, newCode, TTL); // 20분 TTL
        }
    
        return newCode;
    }
    

    async checkVerifyCode(email: string, code: string): Promise<boolean> {
        const key = `register-verify-code:${email}`;
        let existsCode = await this.redisService.get(key);

        if (existsCode === code) {
            await this.redisService.del(key);
            return true;
        }

        return false;
    }
}