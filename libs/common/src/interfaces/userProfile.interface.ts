import { IProfile } from './profile.interface';
import { IUser } from './user.interface';

export enum ProfileTypeEnum {
  GOOGLE = 'GOOGLE',
  NAVER = 'NAVER',
  KAKAO = 'KAKAO',
}

export interface IUserProfile {
  type: ProfileTypeEnum;
  user: IUser;
  profile: IProfile;
}
