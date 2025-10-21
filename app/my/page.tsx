// 'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';
import ImageUploader from '@/components/image-uploader';
import SignoutButton from '@/components/signout-button';
import { auth } from '@/lib/auth';
import DummyProfile from '@/public/dummy-profile.png';
import { updateProfileImage } from '../sign/sign.action';
import ChangeProfile from './change-profile';
import WithDrawButton from './withdraw-button';

export default function My() {
  const session = use(auth());
  if (!session?.user?.name) redirect('/sign');
  const { name, image } = session.user;

  return (
    <div className='container mx-auto grid h-full place-items-center'>
      <div className='w-full rounded-md border p-5 text-center shadow-sm'>
        <h1 className='mb-5 font-semibold text-2xl'>My Page</h1>
        <div className='grid grid-cols-3 gap-2'>
          <div className='flex flex-col items-center justify-between gap-5'>
            <ImageUploader
              src={image || DummyProfile}
              alt={name}
              changeImage={updateProfileImage}
            />
          </div>
          <div className='col-span-2 border p-3'>
            <ChangeProfile user={session.user} />
          </div>
        </div>
        <div className='mt-5 grid grid-cols-3 gap-2'>
          <SignoutButton name={name} />
          <div className='col-span-2 text-right'>
            <WithDrawButton />
          </div>
        </div>
      </div>
    </div>
  );
}
