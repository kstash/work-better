import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.userService.create(createUserDto);
  }

  @Post('validate')
  async validateUser(
    @Body() credentials: { email: string; password: string },
  ): Promise<IUser> {
    const user = await this.userService.findByEmail(credentials.email);
    const isValid = await bcrypt.compare(credentials.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const { password, ...result } = user;
    return result;
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<IUser> {
    return this.userService.findById(id);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<IUser> {
    const user = await this.userService.findByEmail(email);
    const { password, ...result } = user;
    return result;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<IUser>,
  ): Promise<IUser> {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
