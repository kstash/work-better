import { Injectable } from '@nestjs/common';
import { IAttendanceValidationStrategy } from '../../interfaces/attendance.interface';

interface QRValidationData {
  scannedCode: string;
  validCodes: string[];
  timestamp: Date;
  expirationTime: number; // 밀리초 단위
}

@Injectable()
export class QRValidationStrategy implements IAttendanceValidationStrategy {
  async validate(data: QRValidationData): Promise<boolean> {
    // QR 코드가 유효한 코드 목록에 있는지 확인
    if (!data.validCodes.includes(data.scannedCode)) {
      return false;
    }

    // QR 코드의 만료 시간 확인
    const codeData = this.decodeQRData(data.scannedCode);
    if (!codeData || !codeData.generatedAt) {
      return false;
    }

    const generatedTime = new Date(codeData.generatedAt).getTime();
    const currentTime = data.timestamp.getTime();

    return currentTime - generatedTime <= data.expirationTime;
  }

  private decodeQRData(code: string): { generatedAt: string } | null {
    try {
      return JSON.parse(Buffer.from(code, 'base64').toString());
    } catch {
      return null;
    }
  }
}
