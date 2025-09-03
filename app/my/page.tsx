'use client';
import SignoutButton from '@/components/signout-button';
import Link from 'next/link';

export default function My() {
  return (
    <div className='grid place-items-center h-full'>
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
