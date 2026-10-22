import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'emlak_oturum';

export type SessionUser = { id: number; email: string; name: string; role: string };

export function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET .env içinde tanımlı değil');
  return s;
}

// Panel uçlarını korur: geçerli oturum çerezi yoksa 401 döner.
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: SessionUser }>();
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new UnauthorizedException('Giriş yapmalısınız');
    try {
      req.user = jwt.verify(token, jwtSecret()) as SessionUser;
      return true;
    } catch {
      throw new UnauthorizedException('Oturum süresi doldu, tekrar giriş yapın');
    }
  }
}
