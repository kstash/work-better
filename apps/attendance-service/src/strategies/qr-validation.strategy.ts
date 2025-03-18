import { Injectable } from '@nestjs/common';
import { IAttendanceValidationStrategy } from '../interfaces/attendance.interface';
import { QRValidationData } from '../interfaces/validationData.interface';

@Injectable()
export class QRValidationStrategy implements IAttendanceValidationStrategy {
  async validate(data: any): Promise<boolean> {
    const qrData = data as QRValidationData;
    // QR 코드가 유효한 코드 목록에 있는지 확인
    if (!qrData.validCodes.includes(qrData.scannedCode)) {
      return false;
    }

    // QR 코드의 만료 시간 확인
    const codeData = this.decodeQRData(qrData.scannedCode);
    if (!codeData || !codeData.generatedAt) {
      return false;
    }

    const generatedTime = new Date(codeData.generatedAt).getTime();
    const currentTime = qrData.timestamp.getTime();

    return currentTime - generatedTime <= qrData.expirationTime;
  }

  private decodeQRData(code: string): { generatedAt: string } | null {
    try {
      return JSON.parse(Buffer.from(code, 'base64').toString());
    } catch {
      return null;
    }
  }
}
