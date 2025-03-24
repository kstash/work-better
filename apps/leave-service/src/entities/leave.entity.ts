import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LeaveTypeEnum, LeaveStatusEnum } from '../interfaces';

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
    enum: Object.values(LeaveTypeEnum),
  })
  type: LeaveTypeEnum;

  @Prop({ required: true })
  reason: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LeaveStatusEnum),
    default: LeaveStatusEnum.PENDING,
  })
  status: LeaveStatusEnum;

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
