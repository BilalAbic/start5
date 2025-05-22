// Simple check to see if prisma has the expected models
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
console.log('Available models on Prisma client:', Object.keys(prisma));

// Check notification specifically
console.log('Notification model methods:', Object.keys(prisma.notification || {})); 