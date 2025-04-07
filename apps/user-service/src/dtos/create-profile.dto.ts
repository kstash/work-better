export class CreateProfileDto {
  email: string;
  imageUrl: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

export class UpdateProfileDto {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}
