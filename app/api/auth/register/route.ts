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

const usernameRegex = /^[a-z0-9_-]{3,16}$/;

const RegisterSchema = z.object({
  email: z.string().email({ message: 'Geçerli bir email adresi giriniz.' }),
  username: z.string()
    .min(3, { message: 'Kullanıcı adı en az 3 karakter olmalı.' })
    .max(16, { message: 'Kullanıcı adı en fazla 16 karakter olabilir.' })
    .regex(usernameRegex, { 
      message: 'Kullanıcı adı sadece küçük harf, rakam, tire ve alt çizgi içerebilir.' 
    }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalı.' }),
  firstName: z.string()
    .min(2, { message: 'Ad en az 2 karakter olmalı.' })
    .max(50, { message: 'Ad en fazla 50 karakter olabilir.' })
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, { message: 'Ad sadece harf içerebilir.' }),
  lastName: z.string()
    .min(2, { message: 'Soyad en az 2 karakter olmalı.' })
    .max(50, { message: 'Soyad en fazla 50 karakter olabilir.' })
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, { message: 'Soyad sadece harf içerebilir.' })
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
    const { email, username, password, firstName, lastName } = parse.data;

    // Email kontrolü
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Bu email ile zaten bir hesap var.' },
        { status: 409 }
      );
    }

    // Username kontrolü
    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        email, 
        username,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined
    });

    const response = NextResponse.json({
      message: 'Kayıt başarılı',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined
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