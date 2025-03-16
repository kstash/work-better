import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LoginStatus } from '../interfaces/auth.interface';

@Schema({ timestamps: true })
export class LoginAttempt extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  success: boolean;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LoginStatus),
  })
  status: LoginStatus;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  additionalInfo?: string;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
