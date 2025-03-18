import { Location } from './attendance.interface';

export interface QRValidationData {
  scannedCode: string;
  validCodes: string[];
  timestamp: Date;
  expirationTime: number; // 밀리초 단위
}

export interface GPSValidationData {
  userLocation: Location;
  officeLocation: Location;
  maxDistance: number; // 미터 단위
}

export type ValidationData = QRValidationData | GPSValidationData;
