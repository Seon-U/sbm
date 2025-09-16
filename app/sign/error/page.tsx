import Link from 'next/link';
import { use } from 'react';

type Props = {
  searchParams: Promise<{ error: string; email?: string }>;
};

const getMessage = (error: string) => {
  if (error === 'InvalidEmailCheck') return 'Invalid Email Authorization Key!';
  if (error === 'CheckEmail') return 'Check Your Email, Plz!';
};

export default function AuthError({ searchParams }: Props) {
  const { error, email } = use(searchParams);
  return (
    <div className='grid place-items-center'>
      <div className='text-center'>
        <h1 className='mb-5 font-semibold text-2xl'> Sign Error</h1>
        <div className='mt-5 text-red-500'>{getMessage(error)}</div>
        <Link href={`/sign?email=${email}`} className='w-full'>
          Go to Sign
        </Link>
      </div>
    </div>
  );
}
