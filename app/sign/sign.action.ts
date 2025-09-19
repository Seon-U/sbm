'use server';

import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import z from 'zod';
import { signIn, signOut } from '@/lib/auth';
import prisma from '@/lib/db';
import { newToken } from '@/lib/utils';
import { type ValidError, validate } from '@/lib/validator';

export type Provider = 'google' | 'github' | 'naver' | 'kakao';

export const login = async (provider: Provider, callback?: string | null) => {
  await signIn(provider, { redirectTo: callback || '/bookcase' });
};

export const loginNaver = async (redirectTo?: string | null) =>
  login('naver', redirectTo);

//credential login (email, passwd)
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
    console.log('🚀 ~ sign.action.authorize - error:', error);
    if (error instanceof AuthError) {
      let typeErr: string;

      switch (error.type) {
        case 'AccessDenied':
        case 'EmailSignInError':
          typeErr = error.message.split('Read more')[0];
          break;
        case 'OAuthAccountNotLinked':
          typeErr = 'Already registed SNS Account';
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
  await signOut({ redirectTo: '/sign' }); //QQQ: '/'
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
  // return err;
  if (err) return err;

  const { email, nickname, passwd: orgPasswd } = data;
  const mbr = await findMemberByEmail(email);
  if (mbr)
    return { email: { errors: ['Duplicated Email Address!'], value: email } };

  const passwd = await hash(orgPasswd, 10);
  const emailcheck = newToken();
  await prisma.member.create({
    data: { email, nickname, passwd, emailcheck },
  });

  // await sendRegistCheck(email, emailcheck);
  // fetch
  const { NEXT_PUBLIC_URL, INTERNAL_SECRET } = process.env;
  fetch(`${NEXT_PUBLIC_URL}/api/sendmail`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${INTERNAL_SECRET}`,
    },
    body: JSON.stringify({ email, emailcheck }),
  });

  redirect(`sign/error?error=CheckEmail&email=${email}`);
};

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
      passwd,
    },
    where: { email },
  });
