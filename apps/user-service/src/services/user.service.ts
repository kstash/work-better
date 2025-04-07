import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, CreateProfileDto } from '../dtos';
import {
  User,
  IUser,
  Profile,
  UserProfile,
  ProfileTypeEnum,
} from '@work-better/common';
import {
  UserRepository,
  UserProfileRepository,
  ProfileRepository,
} from '../repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly configService: ConfigService,
  ) {}

  // TODO: 이메일 인증 기능 필요
  async create(createUserDto: CreateUserDto): Promise<Omit<IUser, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('사용자 이메일 검색 오류');
    }
  }

  async findById(id: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(id);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('사용자 아이디 검색 오류');
    }
  }

  async update(
    id: string,
    data: Partial<IUser>,
  ): Promise<Omit<IUser, 'password'>> {
    try {
      const user = await this.findById(id);
      if (data.password) {
        const saltRounds = this.configService.get<number>(
          'BCRYPT_SALT_ROUNDS',
          10,
        );
        data.password = await bcrypt.hash(data.password, saltRounds);
      }

      Object.assign(user, data);

      const savedUser = await this.userRepository.save(user);
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('사용자 업데이트 오류');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      await this.userRepository.delete(user);
    } catch (error) {
      throw new InternalServerErrorException('사용자 삭제 오류');
    }
  }

  async createUserProfile(
    dto: CreateProfileDto & { type: ProfileTypeEnum },
  ): Promise<IUser> {
    // 이메일로 사용자 검색
    const user = await this.userRepository.findByEmail(dto.email);
    const userProfile = await this.userProfileRepository.findByType(dto.type);
    if (!userProfile) {
      const profile = await this.profileRepository.createProfile(dto);
      const userProfile = this.userProfileRepository.create({
        user,
        profile,
        type: dto.type,
      });
      await this.userProfileRepository.save(userProfile);
    } else {
      userProfile.profile.accessToken = dto.accessToken;
      userProfile.profile.refreshToken = dto.refreshToken;
      userProfile.profile.tokenExpiry = dto.tokenExpiry;
      await this.userProfileRepository.save(userProfile);
    }
    const updatedUser = await this.findById(user.id);
    return updatedUser;
  }
}
