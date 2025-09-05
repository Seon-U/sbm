'use client';
import Link from 'next/link';
import SignoutButton from '@/components/signout-button';

export default function My() {
  return (
    <div className='grid h-full place-items-center'>
      <div className='w-96 border p-5 text-center'>
        <h1 className='mb-5 text-3xl'>My Page</h1>
        <div className='flex justify-around gap-5'>
          <Link href='/api/auth/signout'>Goto SignOut</Link>
          <SignoutButton />
        </div>
      </div>
    </div>
  );
}
