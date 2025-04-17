import { OAuthPayload } from './oauth-payload.interface';

declare module 'express-session' {
  interface SessionData {
    user?: OAuthPayload;
  }

  interface Session {
    user?: OAuthPayload;
  }
}
