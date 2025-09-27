import { SquareLibraryIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import ThemeChanger from '@/components/theme-changer';
import { auth } from '@/lib/auth';
import { existsFile } from '@/lib/validator';
import DummyProfile from '@/public/dummy-profile.png';

export default function Nav() {
  const session = use(auth());
  const didlogin = !!session?.user;
  console.log('🚀 ~ session:', session?.user);
  return (
    <div className='flex items-center gap-5 py-1'>
      <Link href='/bookcase' className='btn-icon'>
        <SquareLibraryIcon />
      </Link>
      <ThemeChanger />
      {didlogin ? (
        <Link
          href='/my'
          className='relative h-[40px] w-[40px] overflow-hidden rounded-full border'
        >
          <Image
            src={existsFile(session.user?.image) || DummyProfile}
            alt={session.user?.name || 'guest'}
            unoptimized={process.env.NODE_ENV === 'development'}
            priority={false}
            fill
          />
        </Link>
      ) : (
        <Link href='/sign'>Login</Link>
      )}
    </div>
  );
}
