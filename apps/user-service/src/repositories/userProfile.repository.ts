import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileTypeEnum, UserProfile } from '@work-better/common';

@Injectable()
export class UserProfileRepository extends Repository<UserProfile> {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {
    super(
      userProfileRepository.target,
      userProfileRepository.manager,
      userProfileRepository.queryRunner,
    );
  }

  async findByType(type: ProfileTypeEnum): Promise<UserProfile> {
    try {
      const userProfile = await this.userProfileRepository.findOneOrFail({
        where: { type },
      });
      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException('UserProfile find failed');
    }
  }

  async findById(id: string): Promise<UserProfile> {
    try {
      const userProfile = await this.userProfileRepository.findOneOrFail({
        where: { id },
      });
      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException('UserProfile find failed');
    }
  }

  async findAllByUserId(userId: string): Promise<UserProfile[]> {
    try {
      return this.userProfileRepository.find({
        where: { user: { id: userId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('UserProfile find failed');
    }
  }

  async findByProfileId(profileId: string): Promise<UserProfile> {
    try {
      return this.userProfileRepository.findOneOrFail({
        where: { profile: { id: profileId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('UserProfile find failed');
    }
  }

  async findByUserIdAndProfileId(
    userId: string,
    profileId: string,
  ): Promise<UserProfile> {
    try {
      return this.userProfileRepository.findOneOrFail({
        where: { user: { id: userId }, profile: { id: profileId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('UserProfile find failed');
    }
  }

  async createUserProfile(userProfile: UserProfile): Promise<UserProfile> {
    try {
      return this.userProfileRepository.save(userProfile);
    } catch (error) {
      throw new InternalServerErrorException('UserProfile create failed');
    }
  }

  async updateById(
    id: string,
    data: Partial<UserProfile>,
  ): Promise<UserProfile> {
    try {
      const userProfile = await this.findById(id);
      Object.assign(userProfile, data);
      return this.userProfileRepository.save(userProfile);
    } catch (error) {
      throw new InternalServerErrorException('UserProfile update failed');
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.userProfileRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('UserProfile delete failed');
    }
  }
}
