'use client';
import { LogOutIcon } from 'lucide-react';
import { logout } from '@/app/sign/sign.action';
import { Button } from './ui/button';

export default function SignoutButton({ name }: { name: string }) {
  // if (!session?.data?.user) redirect('/');

  return (
    <form action={logout}>
      <Button variant={'success'}>
        <LogOutIcon />
        Signout {name}
      </Button>
    </form>
  );
}
