import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveBalance extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, default: 15 }) // 기본 연차 15일
  totalAnnualLeave: number;

  @Prop({ required: true, default: 15 })
  remainingAnnualLeave: number;

  @Prop({ required: true, default: 60 }) // 기본 병가 60일
  totalSickLeave: number;

  @Prop({ required: true, default: 60 })
  remainingSickLeave: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
