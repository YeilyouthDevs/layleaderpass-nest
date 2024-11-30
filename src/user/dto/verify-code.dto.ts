import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';

export class VerifyDTO {
    @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
    email: string;

    @IsNotEmpty({ message: '코드를 입력해야 합니다.' })
    code: string;
}