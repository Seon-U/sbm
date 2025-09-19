import Link from 'next/link';
import { use } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  searchParams: Promise<{ error: string; email?: string; emailcheck?: string }>;
};

const getMessage = (error: string) => {
  if (error === 'InvalidEmailCheck') return 'Invalid Email Authorization Key!';
  if (error === 'CheckEmail') return 'Check Your Email, Plz!';
};

export default function AuthError({ searchParams }: Props) {
  const { error, email, emailcheck } = use(searchParams);
  return (
    <div className='grid place-items-center'>
      <div className='text-center'>
        <h1 className='mb-5 font-semibold text-2xl'>{error}</h1>
        <div className='mb-5 text-red-500'>{getMessage(error)}</div>

        <div className='flex justify-center gap-2'>
          <Button variant={'outline'} asChild={true}>
            <Link href={`/sign?email=${email}`} className=''>
              Go to Login
            </Link>
          </Button>
          {error === 'CheckEmail' && emailcheck && (
            <Button variant={'primary'}>
              Resend email to <b>{email}</b>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
