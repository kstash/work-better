export enum AttendanceType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export enum ValidationType {
  GPS = 'GPS',
  QR = 'QR',
}

export enum AttendanceMethod {
  GPS = 'GPS',
  QR = 'QR',
  APPROVAL = 'APPROVAL',
  BIOMETRIC = 'BIOMETRIC',
  WIFI = 'WIFI',
  IP_WEBCAM = 'IP_WEBCAM',
  BEACON = 'BEACON',
}

export enum AttendanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface IAttendanceValidationStrategy {
  validate(data: any): Promise<boolean>;
}

export interface IAttendanceRecord {
  id: string;
  userId: string;
  type: AttendanceType;
  method: AttendanceMethod;
  status: AttendanceStatus;
  location?: Location;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
