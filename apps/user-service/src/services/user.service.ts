import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { User, IUser, UserRole } from '@work-better/common';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

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

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findById(id: string): Promise<IUser> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const { password, ...result } = user;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateUserDto.password) {
      const saltRounds = this.configService.get<number>(
        'BCRYPT_SALT_ROUNDS',
        10,
      );
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    await this.userRepository.remove(user);
  }

  async findOrCreateGoogleUser(googleProfile: {
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    googleId: string;
    googleAccessToken: string;
    googleRefreshToken: string;
    googleTokenExpiry: Date;
  }): Promise<IUser> {
    // 이메일로 사용자 검색
    const existingUser = await this.userRepository.findOne({
      where: { email: googleProfile.email },
    });

    // 기존 사용자 존재하면 반환
    if (existingUser) {
      // 프로필 정보 업데이트
      existingUser.googleId = googleProfile.googleId;
      existingUser.googleAccessToken = googleProfile.googleAccessToken;
      existingUser.googleRefreshToken = googleProfile.googleRefreshToken;
      existingUser.googleTokenExpiry = googleProfile.googleTokenExpiry;

      await this.userRepository.save(existingUser);

      const { password, ...result } = existingUser;
      return result;
    }

    // 새 사용자 생성
    const randomPassword = Math.random().toString(36).substring(2, 15);
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
    const { firstName, lastName } = googleProfile;

    const newUser = this.userRepository.create({
      ...googleProfile,
      name: `${firstName} ${lastName}`,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      isActive: true,
    });

    await this.userRepository.save(newUser);
    const { password, ...result } = newUser;
    return result;
  }
}
