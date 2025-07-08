import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const userDoc = user as unknown as UserDocument;
    const isPasswordValid = await userDoc.validatePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = userDoc.toObject();
    return result;
  }

  async login(user: any) {
    await this.usersService.updateLastLogin(user.id);

    const payload = {
      username: user.username,
      sub: user.id,
      isAdmin: user.isAdmin,
      permissions: user.permissions,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        permissions: user.permissions,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password: _, ...result } = user;
    return result;
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        isValid: true,
        userId: payload.sub,
        username: payload.username,
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}
