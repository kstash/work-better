import { Injectable } from '@nestjs/common';
import {
  Location,
  IAttendanceValidationStrategy,
} from '../interfaces/attendance.interface';
import { GPSValidationData } from '../interfaces/validationData.interface';

@Injectable()
export class GPSValidationStrategy implements IAttendanceValidationStrategy {
  async validate(data: any): Promise<boolean> {
    const gpsData = data as GPSValidationData;
    const distance = this.calculateDistance(
      gpsData.userLocation,
      gpsData.officeLocation,
    );
    return distance <= gpsData.maxDistance;
  }

  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // 지구의 반경 (미터)
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위 거리
  }
}
