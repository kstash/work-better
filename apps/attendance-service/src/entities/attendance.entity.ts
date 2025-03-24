import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AttendanceTypeEnum,
  AttendanceMethodEnum,
  AttendanceStatus,
  Location,
  ValidationTypeEnum,
} from '../interfaces';
import { ValidationDataType } from '../interfaces';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AttendanceTypeEnum),
  })
  type: AttendanceTypeEnum;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ValidationTypeEnum),
  })
  validationType: ValidationTypeEnum;

  @Prop({ type: Object })
  validationData: ValidationDataType;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(AttendanceMethodEnum),
  })
  method: AttendanceMethodEnum;

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
