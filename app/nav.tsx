import ThemeChanger from '@/components/theme-changer';
import { auth } from '@/lib/auth';
import { SquareLibraryIcon } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function Nav() {
  const session = use(auth());
  const didlogin = !!session?.user;
  return (
    <div className='flex items-center gap-5'>
      <Link href='/bookcase' className='btn-icon'>
        <SquareLibraryIcon />
      </Link>
      <ThemeChanger />
      {didlogin ? (
        <Link href='/my'>{session.user?.name}</Link>
      ) : (
        <Link href='/sign'>Login</Link>
      )}
    </div>
  );
}
