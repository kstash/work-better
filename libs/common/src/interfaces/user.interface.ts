export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRoleEnum;
  isActive: boolean;

  phoneNumber?: string;
  employeeId?: string;
  department?: string;
  position?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ICredential {
  email: string;
  password: string;
}
