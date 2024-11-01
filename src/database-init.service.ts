import { Injectable, OnModuleInit } from "@nestjs/common";
import * as path from "path";
import * as fs from 'fs/promises';
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class DatabaseInitService implements OnModuleInit {
    constructor(private readonly sequelize: Sequelize) {}

    async onModuleInit() {
        // 개발환경인 경우
        if (process.env.NODE_ENV === 'development') {

            // DB 초기화
            await this.sequelize.sync({ force: true });
            console.log('데이터베이스 초기화 완료.');

            // mock_sql폴더 내 sql파일을 모두 읽어 비동기적으로 실행한다.
            const mockDir = path.join(process.cwd(), 'mock_sql');

            try {
                const files = await fs.readdir(mockDir);

                const sqlPromises = files.map(async (file) => {
                    if (file.endsWith('.sql')) {
                        const filePath = path.join(mockDir, file);
                        const sql = await fs.readFile(filePath, 'utf8');
                        return this.sequelize.query(sql);
                    }
                });

                await Promise.all(sqlPromises);
                console.log('Mock 데이터 생성 완료.');

            } catch (error) {
                console.error('Mock 데이터 생성 중 오류 발생:', error);
            }
        }
    }
}
