import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@work-better/common';
import { Repository } from 'typeorm';

// TODO: 예외처리 통일 작업 필요
// TODO: service 단의 예외처리 작업은 가능한 repository 단에서 하도록 변경
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      throw new NotFoundException('해당 이메일의 사용자를 찾을 수 없습니다.');
      // TODO: 소셜 로그인으로 찾아주는 작업 필요
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

  async updateById(id: string, data: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);
      Object.assign(user, data);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        '사용자 정보 수정 중 오류가 발생했습니다.',
      );
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        '사용자 삭제 중 오류가 발생했습니다.',
      );
    }
  }
}
