// ---
// Gelişmiş güvenlik ve validasyon için eklemeler:
// - Zod ile input validasyonu
// - Memory tabanlı rate limit (IP başına 5 deneme/5dk)
// TODO: Gerçek ortamda Redis gibi merkezi bir rate limit altyapısı kullanın!
// ---

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { createToken, setTokenCookie } from '@/lib/auth';
import { z } from 'zod';

// Memory tabanlı rate limit (sadece örnek, production için uygun değildir)
const rateLimitMap = new Map<string, { count: number; lastTry: number }>();
const RATE_LIMIT = 5; // Maksimum deneme
const WINDOW_MS = 5 * 60 * 1000; // 5 dakika

const LoginSchema = z.object({
  email: z.string().email({ message: 'Geçerli bir email adresi giriniz.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' })
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit kontrolü (IP bazlı)
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

    // Parse ve validasyon
    const body = await req.json();
    const parse = LoginSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz giriş verisi.' },
        { status: 400 }
      );
    }
    const { email, password } = parse.data;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Şifreyi doğrula
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // JWT oluştur
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Yanıtı oluştur
    const response = NextResponse.json({
      message: 'Giriş başarılı',
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
      { error: 'Giriş sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 