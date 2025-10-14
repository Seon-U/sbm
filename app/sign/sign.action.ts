'use server';

import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import path from 'path';
import z from 'zod';
import { auth, signIn, signOut } from '@/lib/auth';
import prisma, { findMemberByEmail } from '@/lib/db';
import { newToken, uniqId, uniqNumId } from '@/lib/utils';
import {
  comparePassword,
  encryptPassword,
  existsEmail,
  type ValidError,
  validate,
  validateAsync,
} from '@/lib/validator';
import type { SendMailBody } from '../api/sendmail/route';

export type Provider = 'google' | 'github' | 'naver' | 'kakao';

export const login = async (provider: Provider, callback?: string | null) => {
  await signIn(provider, { redirectTo: callback || '/bookcase' });
};

export const loginNaver = async (redirectTo?: string | null) =>
  login('naver', redirectTo);

// credential login (email, passwd)
export const authorize = async (
  _preValidError: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z.object({
    email: z.email(),
    passwd: z.string().min(6, 'More than 6 characters!'),
  });
  const [err, data] = validate(zobj, formData);
  if (err) return err;

  try {
    const redirectTo = formData.get('redirectTo')?.toString() || '/bookcase';
    console.log('🚀 ~ redirectTo:', redirectTo);
    // await signIn('credentials', formData);
    await signIn('credentials', { ...data, redirectTo });
  } catch (error) {
    console.log('🚀 sign.action.authorize - error:', error);
    if (error instanceof AuthError) {
      let typeErr: string;
      switch (error.type) {
        case 'AccessDenied':
        case 'EmailSignInError':
          typeErr = error.message.split('Read more')[0];
          break;
        case 'OAuthAccountNotLinked':
          typeErr = `Already registed SNS Account`;
          break;
        case 'CredentialsSignin':
          typeErr =
            error.message.split('Read more')[0] ||
            'Not match Email or Password!';
          break;
        default:
          typeErr = error.message || 'Something went wrong!';
      }

      return {
        email: { errors: [typeErr], value: data.email },
        passwd: { errors: [], value: data.passwd },
      } as ValidError;
    }
    throw error;
  }
};

export const logout = async () => {
  await signOut({ redirectTo: '/sign' }); // QQQ: '/'
};

export const regist = async (
  _preValidError: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z
    .object({
      email: z.email(),
      passwd: z.string().min(6),
      passwd2: z.string().min(6),
      nickname: z.string().min(3),
    })
    .refine(({ passwd, passwd2 }) => passwd === passwd2, {
      path: ['passwd2'],
      message: 'Passwords are not matched!',
    });

  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const { email, nickname, passwd: orgPasswd } = data;
  const existsErr = existsEmail(email);
  if (existsErr) return existsErr;

  const passwd = await encryptPassword(orgPasswd);
  const emailcheck = newToken();
  await prisma.member.create({
    data: { email, nickname, passwd, emailcheck },
  });

  // fetch
  sendmailByFetch({ email, emailcheck });

  redirect(`/sign/error?error=CheckEmail&email=${email}`);
};

export const sendResetPassword = async (
  _: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z.object({
    email: z.email(),
  });
  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const emailcheck = newToken();
  const { email } = data;
  const { nickname } = await prisma.member.update({
    select: { nickname: true },
    where: { email },
    data: { emailcheck },
  });

  const rs = await sendmailByFetch({
    email,
    emailcheck,
    nickname,
    emailType: 'reset-password',
  });

  if (!rs.ok) return { email: { errors: ['Fail to send email!'] } };

  redirect(`/sign/error?error=CheckEmail&email=${email}`);
};

export const resetPassword = async (
  _: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z
    .object({
      email: z.email(),
      emailcheck: z.uuidv4(),
      passwd: z.string().min(6),
      passwd2: z.string().min(6),
    })
    .refine(({ passwd, passwd2 }) => passwd === passwd2, {
      path: ['passwd2'],
      message: 'Not match password and Password confirm!',
    });

  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const { email, passwd2, emailcheck } = data;

  const passwd = await encryptPassword(passwd2, 10);
  await prisma.member.update({
    where: { email, emailcheck },
    data: { passwd, emailcheck: null },
  });

  redirect(`/sign/error?error=Your password changed.`);
};

export const resendRegist = async (
  _: ValidError | undefined,
  formData: FormData
) => {
  const zobj = z.object({
    email: z.email(),
    emailcheck: z.uuidv4(),
  });
  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const { email, emailcheck } = data;
  const mbr = await findMemberByEmail(email);
  if (!mbr || mbr.emailcheck !== emailcheck) {
    redirect('/sign/error?error=EmailSendFail');
  }

  const newEmailCheck = newToken();
  await prisma.member.update({
    where: { email },
    data: { emailcheck: newEmailCheck },
  });

  const rs = await sendmailByFetch({
    email,
    emailcheck: newEmailCheck,
  });
  if (!rs.ok) return { email: { errors: ['Fail to send email!'] } };

  redirect(`/sign/error?error=CheckEmail&email=${email}`);
};

const sendmailByFetch = async ({
  email,
  emailcheck,
  nickname,
  emailType = 'regist',
}: SendMailBody) => {
  const { NEXT_PUBLIC_URL, INTERNAL_SECRET } = process.env;
  return fetch(`${NEXT_PUBLIC_URL}/api/sendmail`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${INTERNAL_SECRET}`,
    },
    body: JSON.stringify({ email, emailcheck, nickname, emailType }),
  });
};

export const sendEmailChangeCode = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login!');
  const { email, name } = session.user;
  const mbr = await findMemberByEmail(email);

  const zobj = z.object({
    newEmail: z.email(),
  });

  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const { newEmail } = data;

  const existsErr = await existsEmail(newEmail, 'newEmail');
  if (existsErr) return { ...existsErr };

  const emailcheck = uniqNumId();
  // 시간 타임아웃 처리
  await prisma.member.update({
    where: { email },
    data: { emailcheck },
  });

  setTimeout(
    async () => {
      await prisma.member.update({
        where: { email },
        data: { emailcheck: null },
      });
    },
    5000 //QQQ: 2 * 60 * 1000);
  );

  await sendmailByFetch({
    email: newEmail,
    emailcheck,
    nickname: name || '',
    emailType: 'email-change-code',
  });
};

export const sendEmailChangeCode_일괄 = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login!');
  const { email } = session.user;
  const mbr = await findMemberByEmail(email);

  const zobj = z
    .object({
      nickname: z.string().min(3),
      newEmail: z.email(),
      curr_passwd: z.string().min(6).optional(),
      passwd: z.string().min(6).optional(),
      passwd2: z.string().min(6).optional(),
    })
    .refine(
      ({ curr_passwd, passwd, passwd2 }) => {
        return (
          (!curr_passwd && !passwd && !passwd2) ||
          (curr_passwd && passwd && passwd2)
        );
      },
      { path: ['passwd2'], message: 'Input the all password to change!' }
    )
    .refine(({ curr_passwd, passwd, passwd2 }) => {
      if (curr_passwd && passwd && passwd2 && mbr?.passwd) {
        return passwd === passwd2;
      }
      return true;
    });

  const [err, data] = validate(zobj, formData);
  if (err) return err;

  const dataErr: ValidError = {};
  for (const [key, value] of Object.entries(data)) {
    dataErr[key] = { errors: [], value };
  }

  const { newEmail, nickname, curr_passwd } = data;
  if (mbr?.passwd && curr_passwd) {
    const validCurrPasswd = await comparePassword(curr_passwd, mbr?.passwd);
    if (!validCurrPasswd)
      return {
        ...dataErr,
        curr_passwd: {
          errors: ['Invalid current password!'],
          value: curr_passwd,
        },
      };
  }

  const existsErr = await existsEmail(newEmail, 'newEmail');
  if (existsErr) return { ...dataErr, ...existsErr };

  const emailcheck = uniqNumId();
  // 시간 타임아웃 처리
  await prisma.member.update({
    where: { email },
    data: { emailcheck },
  });

  setTimeout(
    async () => {
      await prisma.member.update({
        where: { email },
        data: { emailcheck: null },
      });
    },
    5000 //QQQ: 2 * 60 * 1000);
  );

  await sendmailByFetch({
    email,
    emailcheck,
    nickname,
    emailType: 'email-change-code',
  });
  return dataErr;
};

export type UpdateProfileImageReturn = ReturnType<typeof updateProfileImage>;

export const updateProfileImage = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login');

  const { id, email } = session.user;
  const ent = Object.fromEntries(formData.entries());
  console.log('🚀 ~ ent:', ent);
  const zobj = z.object({
    image: z
      .instanceof(File)
      .refine(file => file.size <= 10 * 1024 * 1024, 'Under 10MB!')
      .refine(file => file.type.startsWith('image/'), 'Upload Image only!'),
  });

  const [err, data] = validate(zobj, formData);
  // console.log('🚀 ~ err:', err);
  // console.log('🚀 ~ data:', data);
  if (err) return [err];

  console.log('🚀 ~ data:', data);

  const uploadDir = path.join(process.cwd(), 'public', 'profiles');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir);

  const fileName = `${id}_${uniqId()}_${data.image.name}`;
  const filePath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await data.image.arrayBuffer());
  await writeFile(filePath, buffer);
  const image = `/profiles/${fileName}`;

  const mbr = await prisma.member.update({
    where: { email },
    data: { image },
  });
  revalidatePath('/profiles');
  return [null, mbr];
};

export type UpdateMemberReturn = ReturnType<typeof updateNickname>;
export const updateNickname = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login');

  const { email } = session.user;

  const zobj = z.object({
    nickname: z.string().min(3),
  });

  const [err, data] = validate(zobj, formData);
  if (err) return [err, null] as const;

  const { nickname } = data;
  const mbr = await prisma.member.update({
    where: { email },
    data: { nickname },
  });
  console.log('🚀 ~ mbr:', mbr);
  return [err, mbr] as const;
};

export const updateEmail = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login');

  const { email } = session.user;
  const mbr = await findMemberByEmail(email);

  if (!mbr || !mbr.emailcheck || mbr.emailcheck.length !== 5) {
    return [
      {
        emailChangeCode: { errors: ['Invalid Code!'] },
      } as ValidError,
      null,
    ] as const;
  }

  const zobj = z.object({
    newEmail: z.email(),
    emailChangeCode: z.literal(mbr.emailcheck),
  });
  const [err, data] = validate(zobj, formData);
  if (err) return [err, null] as const;

  const { newEmail } = data;
  const existsErr = await existsEmail(newEmail, 'newEmail');
  if (existsErr) return [existsErr, null] as const;

  const newMbr = await prisma.member.update({
    where: { email },
    data: { email: newEmail, emailcheck: null },
  });

  return [null, newMbr] as const;
};

export const updatePassword = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login');

  const { email } = session.user;
  const mbr = await findMemberByEmail(email, true);

  const zobj = z
    .object({
      curr_passwd: z.string().optional(),
      passwd: z.string().min(6),
      passwd2: z.string().min(6),
    })
    .superRefine(async ({ curr_passwd, passwd, passwd2 }, ctx) => {
      const preIssues = ctx.issues;
      ctx.issues = [];

      const isMatchPassword = await comparePassword(
        curr_passwd || '',
        mbr?.passwd || ''
      );

      if (!isMatchPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Not Match the current password!',
          path: ['curr_passwd'],
        });
      }

      if (passwd !== passwd2)
        ctx.addIssue({
          code: 'custom',
          message: 'Not Match the password confirm!',
          path: ['passwd2'],
        });
      ctx.issues = [...ctx.issues, ...preIssues];
    });

  // const val = await zobj.parseAsync(formData);
  const [err, data] = await validateAsync(zobj, formData);
  if (err) return err;
  console.log('🚀 ~ updatePassword ~ err, data:', err, data);

  const passwd = await encryptPassword(data.passwd);
  await prisma.member.update({
    where: { email },
    data: { passwd },
  });
};

export const withdraw = async () => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error('Need Login');

  const { email } = session.user;
  const outdt = new Date().toISOString().split('T')[0];
  await prisma.member.update({
    where: { email },
    data: { outdt },
  });

  await logout();
  // revalidatePath('/');
};
