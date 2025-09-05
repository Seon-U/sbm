'use client';
import { logout } from '@/app/sign/sign.action';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from './ui/button';

export default function SignoutButton() {
  const session = useSession();
  if (!session?.data?.user) redirect('/');

  return (
    <Button onClick={logout} variant={'success'}>
      Signout {session.data?.user?.name}
    </Button>
  );
}
