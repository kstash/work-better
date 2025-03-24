export interface GoogleProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  googleAccessToken: string;
  googleRefreshToken: string;
  googleTokenExpiry: Date;
}
