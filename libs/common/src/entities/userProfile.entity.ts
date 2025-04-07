import { ProfileTypeEnum } from '../interfaces';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProfileTypeEnum })
  type: ProfileTypeEnum;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Profile, (profile) => profile.id)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
