--TRUNCATE TABLE "TrainingType" RESTART IDENTITY;

INSERT INTO "TrainingType" ("id", "name", "desc", "createdAt", "updatedAt") VALUES
(1, '청년국 예배', '청년국 예배입니다.', NOW(), NOW()),
(2, '기타 훈련', '기타 훈련입니다.', NOW(), NOW()),
(3, '수련회', '수련회 입니다.', NOW(), NOW());
