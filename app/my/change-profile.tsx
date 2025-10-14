'use client';

import { PencilIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useReducer } from 'react';
import LabelEditor from '@/components/label-editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { updateNickname } from '../sign/sign.action';
import EmailChanger from './email-changer';
import PasswordChanger from './password-changer';

type Props = {
  user: {
    isadmin?: boolean | undefined;
  } & User;
};

export default function ChangeProfile({ user }: Props) {
  //revalidate 쓸 거면 required true 주면 됨
  // const { update } = useSession({ required: true });
  const router = useRouter();
  const { update } = useSession();
  const [isEditingEmail, toggleEditingEmail] = useReducer(pre => !pre, true); //QQQ:개발시만 true
  const [isEditingPassword, toggleEditingPassword] = useReducer(
    pre => !pre,
    true
  ); //QQQ:개발시만 true

  const changeNickname = async (formData: FormData) => {
    const ent = Object.fromEntries(formData.entries());
    console.log('🚀 ~ changeNickname ~ ent:', ent);
    const [err, mbr] = await updateNickname(formData);
    if (err) return err;
    console.log(mbr);
    await update(mbr);
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-5 text-left'>
      <LabelEditor
        label='nickname'
        name='nickname'
        defaultValue={user.name || ''}
        saveAction={changeNickname}
      />

      <div className={cn({ 'w-[80%]': isEditingEmail })}>
        {isEditingEmail ? (
          <EmailChanger email={user.email} toggleEditing={toggleEditingEmail} />
        ) : (
          <Button
            onClick={toggleEditingEmail}
            variant={'success'}
            className='mt-3 h-12 w-full'
          >
            <PencilIcon /> {user.email}
          </Button>
        )}
      </div>

      <div className={cn({ 'w-[80%]': isEditingPassword })}>
        {isEditingPassword ? (
          <PasswordChanger toggleEditing={toggleEditingPassword} />
        ) : (
          <Button
            onClick={toggleEditingPassword}
            variant={'destructive'}
            className='mt-3 h-12 w-full'
          >
            <PencilIcon /> Password
          </Button>
        )}
      </div>
    </div>
  );
}
