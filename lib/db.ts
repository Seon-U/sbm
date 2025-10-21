import { PrismaClient } from '@/lib/generated/prisma/client';

const prisma = new PrismaClient();

export default prisma;

export const findMemberByEmail = async (
  email: string,
  isIncludePasswd: boolean = false
) =>
  prisma.member.findUnique({
    select: {
      id: true,
      nickname: true,
      isadmin: true,
      emailcheck: true,
      outdt: true,
      image: true,
      passwd: isIncludePasswd,
    },
    where: { email },
  });

export type Member = Awaited<ReturnType<typeof findMemberById>>;
export type MemberWithCount = Awaited<
  ReturnType<typeof findMemberByIdWithCount>
>;

export const findMemberById = async (id: number | string) =>
  prisma.member.findUnique({
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      isadmin: true,
    },
    where: { id: Number(id) },
  });

export const findMemberByIdWithCount = async (id: number | string) =>
  prisma.member.findUnique({
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      isadmin: true,
      _count: { select: { Book: true, Mark: true } },
    },
    where: { id: Number(id) },
  });
