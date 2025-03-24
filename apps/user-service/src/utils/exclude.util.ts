import { IUser } from '@work-better/common';

/**
 * 비밀번호를 제외한 사용자 정보를 반환하는 유틸리티 함수
 */
function excludePassword(user: IUser & { password: string }): IUser {
  // 새 객체 생성하고 password 속성만 제외
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export { excludePassword };
