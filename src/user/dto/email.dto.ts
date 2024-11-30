import { IsEmail } from 'class-validator';

export class EmailDTO {
    @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
    email: string;
}