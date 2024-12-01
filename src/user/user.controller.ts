import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { EmailDTO } from "./dto/email.dto";
import { RedisService } from "src/redis/redis.service";
import { MailService } from "src/mail/mail.service";
import { VerifyDTO } from "./dto/verify-code.dto";
import { RateLimitExceededException } from "src/exceptions/rate-limit-exceed.exception";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly redisService: RedisService, private readonly mailService: MailService) { }

    @Post('signup')
    async signup(@Body() createUserDTO: CreateUserDTO): Promise<{ message: string }> {
        try {
            const user = await this.userService.createUser(createUserDTO);

            if (user) {
                return { message: '회원가입이 완료되었습니다.' };
            } else {
                throw new HttpException('회원가입이 실패했습니다.', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('회원가입 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('signup/checkEmail')
    async emailCheck(@Body() emailDTO: EmailDTO): Promise<{ message: string }> {
        const { email } = emailDTO;

        const existingUser = await this.userService.findUserByEmail(email);
        if (existingUser) throw new HttpException('이미 사용중인 이메일입니다.', HttpStatus.CONFLICT);

        return { message: '사용 가능한 이메일입니다.' };
    }

    @Post('signup/sendVerifyCode')
    async sendVerifyCode(@Body() emailDTO: EmailDTO): Promise<{ message: string }> {
        const { email } = emailDTO;

        try {
            const code = await this.userService.getOrGenVerifyCode(email);

            // 메일 전송
            await this.mailService.sendMail(email, '회원가입 인증코드입니다.', 'email', { code });
        } catch (error) {
            if (error instanceof RateLimitExceededException) {
                throw new HttpException(
                    { message: '인증코드 요청은 1분마다 가능합니다.' },
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            throw new HttpException({ message: '인증코드 전송중 오류발생. 다시 시도해주세요.' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return { message: '인증코드가 전송되었습니다. 코드는 20분동안 유효합니다.' };
    }

    @Post('signup/checkVerifyCode')
    async checkVerifyCode(@Body() verifyDTO: VerifyDTO): Promise<{ message: string }> {
        const { email, code } = verifyDTO;

        try {
            const isMatch = await this.userService.checkVerifyCode(email, code);

            if (isMatch) return { message: '이메일이 인증되었습니다.' }
            else throw new HttpException({ message: '인증코드가 올바르지 않습니다.' }, HttpStatus.BAD_REQUEST);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException({ message: '인증코드 확인 중 오류발생. 다시 시도해주세요.' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}