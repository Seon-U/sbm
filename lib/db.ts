import { PrismaClient } from '@/lib/generated/prisma/client';

const prisma = new PrismaClient();

export default prisma;

export const findMemberByEmail = async (
  email: string,
  passwd: boolean = false
) =>
  prisma.member.findUnique({
    select: {
      id: true,
      nickname: true,
      isadmin: true,
      emailcheck: true,
      outdt: true,
      image: true,
      passwd,
    },
    where: { email },
  });
