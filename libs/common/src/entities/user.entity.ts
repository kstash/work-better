import { UserRole } from '../interfaces/user.interface';

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
