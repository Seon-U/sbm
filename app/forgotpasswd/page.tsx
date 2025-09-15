import Link from 'next/link';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';

export default function ForgtotPasswd() {
  const sendResetPasswd = async () => {
    'use server';
  };
  return (
    <div className='grid h-full place-items-center'>
      {/* <div className="w-96 rounded-md border p-5 shadow-md"> */}
      <div className='w-96'>
        <h1 className='mb-3 font-semibold text-2xl'>Forget Passwd</h1>
        <div className='mb-5 text-gray-500 text-sm'>
          Enter your email address when joined, and send to instructions to
          reset password.
        </div>

        <form action={sendResetPasswd} className=''>
          <LabelInput
            label='email'
            name='email'
            type='email'
            focus={true}
            placeholder='email@bookmark.com'
          />

          <Button type='submit' variant={'success'} className='my-5 w-full'>
            Send Instructions Email
          </Button>
        </form>

        <div className='text-center'>
          Back to <Link href='/sign'>Login</Link>
        </div>
      </div>
    </div>
  );
}
