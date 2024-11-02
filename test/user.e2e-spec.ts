import { INestApplication, ValidationPipe } from "@nestjs/common"
import { SequelizeModule } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { UserModule } from "src/features/user/user.module";
import * as supertest from "supertest";

describe('회원가입 테스트', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                SequelizeModule.forRoot({
                    dialect: 'sqlite',
                    storage: ':memory:',
                    autoLoadModels: true,
                    synchronize: true,
                    logging: false
                }),
                UserModule
            ]
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true
        }))
        await app.init();
    })

    afterAll(async () => {
        await app.close();
    })

    test('새 User를 생성해야함', () => {
        return supertest(app.getHttpServer())
        .post('/user/signup')
        .send({
            email: 'test@example.com',
            password: 'a12341234',
            name: '홍길동',
            birthday: '2000-01-01'
        })
        .expect(201);
    })

    test('DTO 검증 실패 시 적절한 메세지를 수신해야함', () => {
        return supertest(app.getHttpServer())
        .post('/user/signup')
        .send({
            email: 'invalid-email',
            password: 'short',
            name: '',
            birthday: 'not-a-date'
        })
        .expect(400)
        .expect((res) => {
            const message = res.body.message;

            expect(message).toBeDefined();
            expect(message.length).toEqual(4);
        })
    })
})