import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LeaveType {
  ANNUAL = 'ANNUAL', // 연차
  SICK = 'SICK', // 병가
}

export enum LeaveStatus {
  PENDING = 'PENDING', // 승인대기중
  APPROVED = 'APPROVED', // 승인완료
  REJECTED = 'REJECTED', // 거절
  CANCELLED = 'CANCELLED', // 취소
}

@Schema({ timestamps: true })
export class Leave extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  days: number;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LeaveType),
  })
  type: LeaveType;

  @Prop({ required: true })
  reason: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Prop()
  approverId?: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
