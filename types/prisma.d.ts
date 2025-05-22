import { PrismaClient } from '@prisma/client';

declare global {
  namespace PrismaClient {
    interface PrismaClient {
      project: any;
      media: any;
      user: any;
      comment: any;
    }
  }
}

export {}; 