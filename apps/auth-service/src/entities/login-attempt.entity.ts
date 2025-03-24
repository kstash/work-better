import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LoginAttemptStatusEnum } from '../interfaces';

@Schema({ timestamps: true })
export class LoginAttempt extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LoginAttemptStatusEnum),
  })
  status: LoginAttemptStatusEnum;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
