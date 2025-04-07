import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@work-better/common';
import { CreateProfileDto } from '../dtos';

@Injectable()
export class ProfileRepository extends Repository<Profile> {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {
    super(
      profileRepository.target,
      profileRepository.manager,
      profileRepository.queryRunner,
    );
  }

  async findById(id: string): Promise<Profile> {
    try {
      const profile = await this.profileRepository.findOneOrFail({
        where: { id },
      });
      return profile;
    } catch (error) {
      throw new InternalServerErrorException('프로필 아이디 검색 오류');
    }
  }

  async createProfile(dto: CreateProfileDto): Promise<Profile> {
    try {
      const profile = this.profileRepository.create(dto);
      return await this.profileRepository.save(profile);
    } catch (error) {
      throw new InternalServerErrorException('프로필 생성 오류');
    }
  }

  async findByEmail(email: string): Promise<Profile> {
    try {
      const profile = await this.profileRepository.findOneOrFail({
        where: { email },
      });
      return profile;
    } catch (error) {
      throw new InternalServerErrorException('프로필 이메일 검색 오류');
    }
  }

  async updateById(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      const profile = await this.findById(id);
      Object.assign(profile, data);
      return await this.profileRepository.save(profile);
    } catch (error) {
      throw new InternalServerErrorException('프로필 수정 오류');
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.profileRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('프로필 삭제 오류');
    }
  }
}
