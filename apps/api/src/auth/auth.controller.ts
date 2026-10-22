import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { AuthGuard, COOKIE_NAME, jwtSecret, type SessionUser } from './auth.guard';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const user = body.email ? await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } }) : null;
    const ok = user && body.password ? await bcrypt.compare(body.password, user.passwordHash) : false;
    if (!user || !ok) throw new UnauthorizedException('E-posta veya şifre hatalı');

    const session: SessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(session, jwtSecret(), { expiresIn: '7d' });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true, // tarayıcıdaki JavaScript okuyamaz
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SEVEN_DAYS,
      path: '/',
    });
    return session;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request & { user: SessionUser }) {
    return req.user;
  }
}
