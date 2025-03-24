import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ValidationDataType,
  QRValidationData,
  QRCodeData,
} from '../interfaces';
import { AttendanceValidationStrategy } from './base.strategy';

@Injectable()
export class QRValidationStrategy implements AttendanceValidationStrategy {
  async validate(data: ValidationDataType): Promise<boolean> {
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

  private decodeQRData(code: string): QRCodeData {
    try {
      const decodedData = JSON.parse(
        Buffer.from(code, 'base64').toString(),
      ) as QRCodeData;
      return decodedData;
    } catch (error) {
      throw new BadRequestException('QR 코드 디코딩에 실패했습니다.');
    }
  }
}
