import { type NextRequest, NextResponse } from 'next/server';
import { sendPasswordReset, sendRegistCheck } from '@/app/sign/mail.action';

export type SendMailBody = {
  email: string;
  emailcheck: string;
  nickname?: string;
  emailType?: 'regist' | 'reset-password';
};

// POST /api/sendmail
export async function POST(req: NextRequest) {
  const {
    email,
    emailcheck,
    nickname,
    emailType = 'regist',
  }: SendMailBody = await req.json();

  const authorization = req.headers.get('authorization');
  if (authorization !== `Bearer ${process.env.INTERNAL_SECRET}`)
    throw new Error('InvalidToken');

  const rs =
    emailType === 'regist'
      ? await sendRegistCheck(email, emailcheck)
      : await sendPasswordReset(email, emailcheck, nickname);

  return NextResponse.json(rs);
}
