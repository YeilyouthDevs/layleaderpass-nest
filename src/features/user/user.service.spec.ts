import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service"
import { getModelToken } from "@nestjs/sequelize";
import { User } from "./user.model";

describe('UserService', () => {

    let service: UserService;
    let mockUserModel: { 
        create: jest.Mock;
    };

    beforeEach(async () => {
        mockUserModel = {
            create: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User),
                    useValue: mockUserModel
                }
            ]
        }).compile();

        service = module.get(UserService);
    })

    test('값이 존재해야함', () => {
        expect(service).toBeDefined();
    })


})