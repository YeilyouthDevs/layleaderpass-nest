TRUNCATE TABLE "User" RESTART IDENTITY;

-- 비밀번호는 a12341234 로 통일
INSERT INTO "User" (email, password, name, birthday, role, "createdAt") VALUES
('user1@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '홍길동', '2000-01-01', 'ADMIN', NOW()),
('user2@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '김철수', '1990-06-01', 'USER', NOW()),
('user3@example.com', '$2b$10$MQQWwT3f/p5LgY5oVYp22u1J6ga4AkgtCqhYCmuRg5GEl2SqWO3l6', '신짱구', '1990-06-01', 'GUEST', NOW());