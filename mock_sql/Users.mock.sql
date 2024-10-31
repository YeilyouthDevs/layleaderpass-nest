TRUNCATE TABLE "Users" RESTART IDENTITY;

INSERT INTO "Users" (email, password, name, "createdAt", "updatedAt") VALUES
('test@example.com', 'password123', '홍길동', NOW(), NOW()),
('sample@example.com', 'password456', '김철수', NOW(), NOW());