import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/db';

// /forgotpasswd/ADFF-SADF-sadf/
export default async function ResetForgotPasswd({
  params,
}: {
  params: Promise<{ emailcheck: string }>;
}) {
  const { emailcheck } = await params;
  console.log('🚀 ~ emailcheck:', emailcheck);

  const mbr = await prisma.member.findFirst({
    select: { nickname: true, emailcheck: true, email: true },
    where: { emailcheck },
  });

  if (emailcheck !== mbr?.emailcheck)
    redirect('/sign/error?error=InvalidEmailCheck');

  const resetPassword = async (formData: FormData) => {
    'use server';
    //유효성 체크 필요 - 별도 유효성(not null 등 처리 후에는 오버로드 에러 제거될 듯.)
    const passwd = await hash(formData.get('passwd'), 10);
    await prisma.member.update({
      where: { email: mbr.email },
      data: { passwd },
    });
  };

  return (
    <div className='grid h-full place-items-center'>
      {/* <div className='w-96 rounded-md border p-5 shadow-md'> */}
      <div className='w-96'>
        <h1 className='mb-3 font-semibold text-2xl'>Change Password</h1>
        <div className='text-gray-500 text-sm'>Hello, {mbr?.nickname}</div>
        <div className='mb-5 text-gray-500 text-sm'>Reset your password</div>

        <form action={resetPassword} className=''>
          <LabelInput
            label='new password'
            name='passwd'
            type='password'
            focus={true}
            placeholder='new password...'
          />
          <LabelInput
            label='new password confirm'
            name='passwd2'
            type='password'
            placeholder='new password confirm...'
            className='mt-5'
          />

          <Button type='submit' variant={'destructive'} className='my-5 w-full'>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}
