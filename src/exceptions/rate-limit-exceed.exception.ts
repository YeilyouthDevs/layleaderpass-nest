export class RateLimitExceededException extends Error {
    constructor() {
        super('요청빈도 제한 초과');
    }
}