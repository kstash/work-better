import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor(message = '이메일 또는 비밀번호가 잘못되었습니다.') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class UserServiceUnavailableException extends HttpException {
  constructor(
    message = '사용자 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class AuthenticationException extends HttpException {
  constructor(message = '인증 처리 중 오류가 발생했습니다.') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class InvalidTokenException extends HttpException {
  constructor(message = '유효하지 않은 토큰입니다.') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class AccountLockedException extends HttpException {
  constructor(message = '계정이 잠겼습니다. 잠시 후 다시 시도해주세요.') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
