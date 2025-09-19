'use client';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/sign/sign.action';
import { Button } from './ui/button';

export default function SignoutButton() {
  const session = useSession();
  // if (!session?.data?.user) redirect('/');

  return (
    <form action={logout}>
      <Button variant={'success'}>Signout {session.data?.user?.name}</Button>
    </form>
  );
}
