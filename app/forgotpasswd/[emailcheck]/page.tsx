import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import ResetPasswd from './reset-passwd';

// /forgotpasswd/ADFF-SADF-sadf/
export default async function ResetForgotPasswd({
  params,
}: {
  params: Promise<{ emailcheck: string }>;
}) {
  const { emailcheck } = await params;

  const mbr = await prisma.member.findFirst({
    select: { nickname: true, emailcheck: true, email: true },
    where: { emailcheck },
  });

  if (emailcheck !== mbr?.emailcheck)
    redirect('/sign/error?error=InvalidEmailCheck');

  return (
    <div className='grid h-full place-items-center'>
      {/* <div className='w-96 rounded-md border p-5 shadow-md'> */}
      <div className='w-96'>
        <h1 className='mb-3 font-semibold text-2xl'>Change Password</h1>
        <div className='text-gray-500 text-sm'>
          Hello, <strong>{mbr?.nickname}</strong>
        </div>
        <div className='mb-5 text-gray-500 text-sm'>Reset your password</div>

        <ResetPasswd email={mbr.email} emailcheck={emailcheck} />
      </div>
    </div>
  );
}
