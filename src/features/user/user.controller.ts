import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('signup/schema')
    async getSignupSchema(): Promise<Record<string, any>> {
        const schemas = validationMetadatasToSchemas();
        return schemas[CreateUserDTO.name];
    }

    @Post('signup')
    async signup(@Body() createUserDTO: CreateUserDTO): Promise<{ message: string }> {
        try {
            const user = await this.userService.createUser(createUserDTO);

            if (user) {
                return { message: 'User created successfully' };
            } else {
                throw new HttpException('User creation failed', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException(error.message || 'User creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}