import { Injectable, OnModuleInit } from "@nestjs/common";
import * as path from "path";
import * as fs from 'fs/promises';
import { Sequelize } from "sequelize-typescript";
import { NodeEnv } from "./enums/node-env.enum";

@Injectable()
export class DatabaseInitService implements OnModuleInit {
    constructor(private readonly sequelize: Sequelize) { }

    async onModuleInit() {
        if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
            // 개발 환경: 데이터베이스 초기화 및 Mock 데이터 삽입
            await this.sequelize.sync({ force: true });
            console.log('개발 환경: 데이터베이스 초기화 완료.');

            await this.loadMockData();
        } else if (process.env.NODE_ENV === NodeEnv.PRODUCTION) {
            // 운영 환경: 데이터베이스 동기화 (테이블이 없으면 생성)
            await this.sequelize.sync();
            console.log('운영 환경: 데이터베이스 동기화 완료.');
        }
    }

    private async loadMockData() {
        const mockDir = path.join(process.cwd(), 'mockSQL');
        try {
            const files = await fs.readdir(mockDir);
            for (const file of files) {
                if (file.endsWith('.sql')) {
                    const filePath = path.join(mockDir, file);
                    const sql = await fs.readFile(filePath, 'utf8');
                    await this.sequelize.query(sql);
                }
            }
            console.log('Mock 데이터 생성 완료.');
        } catch (error) {
            console.error('Mock 데이터 생성 중 오류 발생:', error);
        }
    }
}
