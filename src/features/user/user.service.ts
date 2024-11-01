import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { CreateUserDTO } from "./dto/create-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private readonly userModel: typeof User
    ) { }

    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        return this.userModel.create(createUserDTO as User);
    }
}