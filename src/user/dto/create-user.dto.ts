import { IsDateString, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class CreateUserDTO {

    @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
    email: string;

    @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
    @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    password: string;

    @IsString({ message: '이름은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '이름이 입력되지 않았습니다.' })
    name: string;

    @IsPhoneNumber('KR', { message: '전화번호 형식이어야 합니다.' })
    phone: string;

    @IsDateString({}, { message: '생년월일은 2000-01-01 같은 형식이어야 합니다.' })
    birthday: Date; 
}