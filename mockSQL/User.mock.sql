TRUNCATE TABLE "User" RESTART IDENTITY;

INSERT INTO "User" (email, password, name, birthday, "createdAt") VALUES
('test@example.com', 'password123', '홍길동', '2000-01-01', NOW()),
('sample@example.com', 'password456', '김철수', '1990-06-01', NOW());