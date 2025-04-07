import { InjectRepository } from '@nestjs/typeorm';
import { Profile, UserProfile } from '@work-better/common';
import { CreateProfileDto, UpdateProfileDto } from '../dtos';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create(dto);
    await this.profileRepository.save(profile);
    return profile;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  async deleteProfile(id: string): Promise<void> {
    await this.profileRepository.delete(id);
  }

  async findProfileById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }
    return profile;
  }

  async findProfileByEmail(email: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { email } });
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }
    return profile;
  }
}
