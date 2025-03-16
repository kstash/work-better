export class JwtPayloadDto {
  sub: string;
  email: string;
  role: string;

  constructor(partial: Partial<JwtPayloadDto>) {
    Object.assign(this, partial);
  }
}
