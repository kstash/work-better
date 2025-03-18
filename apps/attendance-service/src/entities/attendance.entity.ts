import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AttendanceType,
  AttendanceMethod,
  AttendanceStatus,
  Location,
  ValidationType,
} from '../interfaces/attendance.interface';
import { ValidationData } from '../interfaces/validationData.interface';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AttendanceType),
  })
  type: AttendanceType;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ValidationType),
  })
  validationType: ValidationType;

  @Prop({ type: Object })
  validationData: ValidationData;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AttendanceMethod),
  })
  method: AttendanceMethod;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AttendanceStatus),
    default: AttendanceStatus.PENDING,
  })
  status: AttendanceStatus;

  @Prop({ type: Object })
  location?: Location;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
