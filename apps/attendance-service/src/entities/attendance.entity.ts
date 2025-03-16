import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AttendanceType,
  AttendanceMethod,
  AttendanceStatus,
  Location,
  ValidationType,
} from '../interfaces/attendance.interface';

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

  @Prop({ required: true })
  timestamp: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ValidationType),
  })
  validationType: ValidationType;

  @Prop({ type: Object })
  validationData: any;

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
