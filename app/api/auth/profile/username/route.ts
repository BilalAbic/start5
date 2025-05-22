import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const usernameRegex = /^[a-z0-9_-]{3,16}$/;

const UsernameSchema = z.object({
  username: z.string()
    .min(3, { message: 'Kullanıcı adı en az 3 karakter olmalı.' })
    .max(16, { message: 'Kullanıcı adı en fazla 16 karakter olabilir.' })
    .regex(usernameRegex, { 
      message: 'Kullanıcı adı sadece küçük harf, rakam, tire ve alt çizgi içerebilir.' 
    })
});

export async function PUT(req: NextRequest) {
  try {
    // Kullanıcı doğrulaması
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Yetkilendirme hatası. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    // İstek gövdesini oku ve doğrula
    const body = await req.json();
    const validationResult = UsernameSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || 'Geçersiz kullanıcı adı.' },
        { status: 400 }
      );
    }

    const { username } = validationResult.data;

    // Kullanıcının mevcut verileri getir
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        username: true,
        usernameLastChanged: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // Kullanıcı adı değişim sınırlaması kontrolü
    if (user.usernameLastChanged) {
      const lastChangeDate = new Date(user.usernameLastChanged);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (lastChangeDate > oneYearAgo) {
        return NextResponse.json(
          { error: 'Kullanıcı adınızı yılda en fazla bir kez değiştirebilirsiniz.' },
          { status: 429 }
        );
      }
    }

    // Kullanıcı adı benzersizlik kontrolü
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor.' },
          { status: 409 }
        );
      }
    } else {
      // Kullanıcı adı değişmiyorsa, güncelleme yapma
      return NextResponse.json(
        { message: 'Kullanıcı adınız değişmedi.', username: user.username },
        { status: 200 }
      );
    }

    // Kullanıcı adını güncelle
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        username,
        usernameLastChanged: new Date()
      }
    });

    return NextResponse.json({
      message: 'Kullanıcı adı başarıyla güncellendi.',
      username: updatedUser.username
    });
  } catch (error) {
    console.error('Username update error:', error);
    
    return NextResponse.json(
      { error: 'Kullanıcı adı güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 