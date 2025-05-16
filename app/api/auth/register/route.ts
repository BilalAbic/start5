// ---
// Gelişmiş güvenlik ve validasyon için eklemeler:
// - Zod ile input validasyonu
// - Memory tabanlı rate limit (IP başına 5 deneme/5dk)
// TODO: Gerçek ortamda Redis gibi merkezi bir rate limit altyapısı kullanın!
// ---

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createToken, setTokenCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';

const rateLimitMap = new Map<string, { count: number; lastTry: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 5 * 60 * 1000;

const RegisterSchema = z.object({
  email: z.string().email({ message: 'Geçerli bir email adresi giriniz.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' })
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rl = rateLimitMap.get(ip) || { count: 0, lastTry: 0 };
    if (now - rl.lastTry > WINDOW_MS) {
      rl.count = 0;
    }
    rl.count++;
    rl.lastTry = now;
    rateLimitMap.set(ip, rl);
    if (rl.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parse = RegisterSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz kayıt verisi.' },
        { status: 400 }
      );
    }
    const { email, password } = parse.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email ile zaten bir hesap var.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Kayıt başarılı',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 