import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/enums/user-role.enum';

// 메타데이터 키 정의
export const CHECK_SESSION_KEY = 'check_session';

export interface CheckSessionOptions {
  minRole?: UserRole;
}

// 세션 체크를 위한 커스텀 데코레이터
export const CheckSession = (options: CheckSessionOptions) => {
  return SetMetadata(CHECK_SESSION_KEY, options);
};
