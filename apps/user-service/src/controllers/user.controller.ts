import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services';
import { CreateUserDto, CreateProfileDto } from '../dtos';
import { IUser, ICredential, ProfileTypeEnum } from '@work-better/common';
import * as bcrypt from 'bcrypt';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<IUser, 'password'>> {
    return this.userService.create(createUserDto);
  }

  @Post('validate')
  async validateUser(@Body() credentials: ICredential): Promise<IUser> {
    const user = await this.userService.findByEmail(credentials.email);
    const isValid = await bcrypt.compare(credentials.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }
    return user;
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<IUser> {
    return this.userService.findById(id);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<IUser> {
    return await this.userService.findByEmail(email);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<IUser>,
  ): Promise<Omit<IUser, 'password'>> {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  @Post('oauth/google')
  async createGoogleUserProfile(
    @Body() data: CreateProfileDto,
  ): Promise<Omit<IUser, 'password'>> {
    return this.userService.createUserProfile({
      ...data,
      type: ProfileTypeEnum.GOOGLE,
    });
  }

  @Post('oauth/naver')
  async createNaverUserProfile(
    @Body() data: CreateProfileDto,
  ): Promise<Omit<IUser, 'password'>> {
    return this.userService.createUserProfile({
      ...data,
      type: ProfileTypeEnum.NAVER,
    });
  }
}
