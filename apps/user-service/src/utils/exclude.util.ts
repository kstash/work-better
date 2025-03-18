import { IUser } from '../interfaces/user.interface';

/**
 * 비밀번호를 제외한 사용자 정보를 반환하는 유틸리티 함수
 */
function excludePassword(user: IUser & { password: string }): IUser {
  // 새 객체 생성하고 password 속성만 제외
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.employeeId && { employeeId: user.employeeId }),
    ...(user.department && { department: user.department }),
    ...(user.position && { position: user.position }),
  };
  return userWithoutPassword;
}

export { excludePassword };
