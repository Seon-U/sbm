'use client';

import { CheckLineIcon, SaveIcon } from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';

type Props = {
  user: {
    isadmin?: boolean | undefined;
  } & User;
};

export default function ChangeProfile({ user }: Props) {
  const { update } = useSession({ required: true });

  const [diffEmail, setDiffEmail] = useState(false);

  return (
    <form className='space-y-3 text-left'>
      <LabelInput
        label='nickname'
        name='nickname'
        focus={true}
        defaultValue={user.name || ''}
      />
      <div className='mb-7 flex items-end gap-2'>
        <LabelInput
          label='email'
          name='email'
          focus={true}
          defaultValue={user.email || ''}
          onChange={e => setDiffEmail(e.target.value !== user.email)}
          className='w-full'
        />
        {diffEmail && <Button variant={'success'}>Send Verify Code!</Button>}
      </div>

      <LabelInput
        label='Current Password'
        name='curr_passwd'
        type='password'
        placeholder='current password...'
      />
      <LabelInput
        label='New Password'
        name='new_passwd'
        type='password'
        placeholder='new password...'
      />
      <LabelInput
        label='New Password Confirm'
        name='passwd2'
        type='password'
        placeholder='new password confirm...'
      />

      <div className='flex justify-center gap-3'>
        <Button type='reset' variant={'outline'}>
          Cancle
          <CheckLineIcon />
        </Button>
        <Button type='submit' variant={'primary'}>
          Save
          <SaveIcon />
        </Button>
      </div>
    </form>
  );
}
