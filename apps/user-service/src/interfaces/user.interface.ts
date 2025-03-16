export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  employeeId?: string;
  department?: string;
  position?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
