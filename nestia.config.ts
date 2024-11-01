const config = {
    input: "src/features/**/*.controller.ts",    // 컨트롤러가 위치한 디렉토리
    output: "src/api",           // 생성된 클라이언트 코드가 저장될 디렉토리
    swagger: {
        output: "swagger.json"   // 생성된 Swagger 문서의 위치
    },
};
export default config;
