import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export interface UserDocument extends User, Document {
  validatePassword(password: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: String, nullable: true })
  permissionsText: string;

  @Prop({ type: Date, nullable: true })
  lastLogin: Date;

  get permissions(): string[] {
    return this.permissionsText ? JSON.parse(this.permissionsText) : [];
  }

  set permissions(value: string[]) {
    this.permissionsText = JSON.stringify(value);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function(next) {
  // 使用Document类型，避免UserDocument类型检查
  const user = this as Document & { password: string, isModified: (path: string) => boolean };
  
  // 只有密码被修改时才重新加密
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// 添加validatePassword方法到Schema
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
