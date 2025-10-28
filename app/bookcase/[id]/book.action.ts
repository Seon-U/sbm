'use server';

import z from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { validate, validateAsync } from '@/lib/validator';

export const saveBook = async (formData: FormData) => {
  const user = await checkLogin();

  const member = Number(user.id);
  console.log('🚀 ~ formData:', Object.fromEntries(formData.entries()));

  const zobj = z
    .object({
      title: z.string().min(1),
      ispublic: z.string().optional(),
      withdel: z.string().optional(),
      remark: z.string().optional(),
    })
    .refine(({ ispublic, withdel }) => !ispublic || (ispublic && !withdel), {
      path: ['withdel'],
      message: 'Public book cannot have open with deletion!',
    });

  const [err, data] = validate(zobj, formData);
  // console.log('🚀 ~ err:', err, data);
  if (err) return err;

  const id = Number(formData.get('id'));
  const { id: userId, isadmin } = user;

  if (id) {
    await prisma.book.update({
      where: isadmin ? { id } : { id, member: Number(userId) },
      data: {
        ...data,
        ispublic: data.ispublic === 'on',
        withdel: !!data.withdel,
      },
    });
  } else {
    await prisma.book.create({
      data: {
        ...data,
        ispublic: data.ispublic === 'on',
        withdel: !!data.withdel,
        member,
      },
    });
  }
};

const checkLogin = async () => {
  const session = await auth();
  if (!session?.user || !session.user.id) throw new Error('Need Login');
  return session.user;
};

export const deleteBook = async (id: number) => {
  const user = await checkLogin();

  const zobj = z
    .object({
      id: z.number(),
    })
    .superRefine(async ({ id }, ctx) => {
      const book = await prisma.book.findUnique({
        where: { id },
        // where: {id: id+ 10000}
      });
      if (!book) {
        ctx.addIssue({
          code: 'custom',
          message: `This Book(#${id}) is not exists!`,
          path: ['id'],
        });
      }
    });

  const [err] = await validateAsync(zobj, { id });
  if (err) return err;

  const { id: userId, isadmin } = user;
  //check exist
  await prisma.book.delete({
    where: isadmin ? { id } : { id, member: Number(userId) },
  });
};

export const likesAndReports = async (member: number) => {
  const ilikes = await prisma.likes.findMany({
    where: { member },
    select: { mark: true },
  });
  const ireports = await prisma.report.findMany({
    where: { member },
    select: { mark: true },
  });

  return [ilikes, ireports];
};

export const deleteMark = async (id: number, bookOwner: number) => {
  const { id: userId, isadmin } = await checkLogin();
  console.log('🚀 ~ userId:', userId, id, bookOwner);

  //check exists
  const mark = await prisma.mark.findUnique({
    where: { id },
  });
  if (!mark) throw new Error(`This Mark(#${id}) is not exists!`);
  if (!isadmin && Number(userId) !== bookOwner && mark.maker !== Number(userId))
    throw new Error(`You have not authentication!`);

  await prisma.mark.delete({
    where: { id },
  });
};

export const toggleLikesORReportMark = async (
  mark: number,
  type: 'likes' | 'reports'
) => {
  const { id: userId } = await checkLogin();
  const member = Number(userId);

  const data = { mark, member };
  const where = { where: data };
  const whereMarkMember = { where: { mark_member: data } };

  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // if (mark === 4) throw new Error('XXXXXXXXX');

  // select count(*) from Likes where mark = mark and member=userId
  const likesCnt = await (type === 'likes'
    ? prisma.likes.count(where)
    : prisma.report.count(where));

  if (likesCnt > 0) {
    return type === 'likes'
      ? prisma.likes.delete(
          // where: { mark, member: Number(userId) }, many!
          whereMarkMember
        )
      : prisma.report.delete(whereMarkMember);
  } else {
    return type === 'likes'
      ? prisma.likes.create({ data })
      : prisma.report.create({ data });
  }
};

export const toggleLikesOrReportMarkIMade = async (
  mark: number,
  type: 'likes' | 'reports'
) => {
  const { id: userId } = await checkLogin();
  const member = Number(userId);

  const data = { mark, member };
  const where = { where: data };
  const whereMarkMember = { where: { mark_member: data } };

  // 취향탈듯, likes 검증은 1번에 처리냐 같은 기능단위로 묶느냐
  //likes검증값을 미리 변수에 담아둔다면 위랑 결국 비슷할듯
  if (type === 'likes') {
    //toggleLikes
    const didCnt = await prisma.likes.count(where);
    return didCnt > 0
      ? prisma.likes.delete(whereMarkMember)
      : prisma.likes.create({ data });
  } else {
    //toggleReports 로 나눠서 호출할 것 같기도 하다.
    const didCnt = await prisma.report.count(where);
    return didCnt > 0
      ? prisma.report.delete(whereMarkMember)
      : prisma.report.create({ data });
  }
};
