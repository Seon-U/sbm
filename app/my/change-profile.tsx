'use client';

import { CheckLineIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useReducer } from 'react';
import LabelEditor from '@/components/label-editor';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import { updateNickname } from '../sign/sign.action';
import EmailChanger from './email-changer';

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

  const changeNickname = async (formData: FormData) => {
    const [err, mbr] = await updateNickname(formData);
    if (err) return err;
    await update(mbr);
    router.refresh();
  };

  return (
    <div className='space-y-3 text-left'>
      <LabelEditor
        label='nickname'
        name='nickname'
        defaultValue={user.name || ''}
        saveAction={changeNickname}
      />
      {isEditingEmail ? (
        <EmailChanger email={user.email} toggleEditing={toggleEditingEmail} />
      ) : (
        <Button
          onClick={toggleEditingEmail}
          variant={'success'}
          className='mt-3'
        >
          Change {user.email}
        </Button>
      )}
      <LabelInput
        label='Current Password'
        name='curr_passwd'
        type='password'
        placeholder='current password...'
      />
      <LabelInput
        label='New Password'
        name='passwd'
        type='password'
        placeholder='new password...'
      />
      <LabelInput
        label='New Password Confirm'
        name='passwd2'
        type='password'
        placeholder='new password confirm...'
      />

      <div className='flex justify-center gap-5'>
        <Button type='reset' variant={'outline'}>
          <CheckLineIcon />
          Cancle
        </Button>
        <Button type='submit' variant={'primary'}>
          <SaveIcon />
          Save
        </Button>
      </div>
    </div>
  );
}
