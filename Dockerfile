# 베이스 이미지
FROM node:22 as builder

# 작업 디렉토리 설정
WORKDIR /app

# Backend 복사 및 빌드
COPY backend ./backend
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Frontend 복사 및 빌드
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 병합
WORKDIR /app
RUN mkdir -p layleaderpass/build
RUN mkdir -p layleaderpass/dist
RUN mkdir -p layleaderpass/templates

RUN cp -r frontend/build/* layleaderpass/build/
RUN cp -r backend/dist/* layleaderpass/dist/
RUN cp -r backend/templates/* layleaderpass/templates/

RUN cp backend/package.json layleaderpass/
RUN cp backend/package-lock.json layleaderpass/


# 배포 종속성 설치
WORKDIR /app/layleaderpass
RUN npm install --production

# 실행 환경
FROM node:22 as runner

WORKDIR /app
COPY --from=builder /app/layleaderpass ./layleaderpass

# 포트 설정
EXPOSE 3000

# 실행 명령어
CMD ["node", "layleaderpass/dist/main.js"]
