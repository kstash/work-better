export interface IProfile {
  id: string;
  email: string;
  imageUrl: string;
  name?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}
