--TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;

-- 비밀번호는 a12341234 로 통일
INSERT INTO "User" ("email", "password", "name", "birthday", "role", "phone", "createdAt") VALUES
('user1@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '홍길동', '2000-01-01', 3, '01012345678', NOW()),
('user2@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '김철수', '1990-06-01', 2, '01012345678', NOW()),
('user3@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '신짱구', '1990-06-01', 1, '01012345678', NOW());