import { ValidationDataType } from '../interfaces';

export interface AttendanceValidationStrategy {
  validate(data: ValidationDataType): Promise<boolean>;
}
