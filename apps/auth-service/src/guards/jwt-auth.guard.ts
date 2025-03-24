import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationException } from '../exceptions';
import { IUser } from '@work-better/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = IUser>(
    err: Error | null,
    user: TUser | null,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    if (err || !user) {
      throw new AuthenticationException();
    }
    return user;
  }
}
