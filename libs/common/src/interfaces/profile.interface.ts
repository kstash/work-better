export interface IProfile {
  id: string;
  email: string;
  imageUrl: string;

  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;

  createdAt: Date;
  updatedAt: Date;
}
