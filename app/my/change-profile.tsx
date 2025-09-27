'use client';

import { CheckLineIcon, SaveIcon } from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useActionState, useReducer, useState } from 'react';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValidError } from '@/lib/validator';
import { sendEmailChangeCode } from '../sign/mail.action';

type Props = {
  user: {
    isadmin?: boolean | undefined;
  } & User;
};

export default function ChangeProfile({ user }: Props) {
  //revalidate 쓸 거면 required true 주면 됨
  // const { update } = useSession({ required: true });
  const { update } = useSession();
  const [diffEmail, setDiffEmail] = useState(false);
  const [didSendCode, toggleSendCode] = useReducer(pre => !pre, false);
  const [emailError, sendEmailCode, isEmailPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      const err = await sendEmailChangeCode(formData);
      if (err) return err;
      toggleSendCode();
    },
    undefined
  );

  return (
    <form className='space-y-3 text-left'>
      <LabelInput
        label='nickname'
        name='nickname'
        defaultValue={user.name || ''}
        error={emailError}
      />
      <div
        className={cn(
          { 'mt-5': didSendCode, 'mb-7': !didSendCode },
          'flex items-end gap-2'
        )}
      >
        <LabelInput
          label='email'
          name='newEmail'
          defaultValue={user.email || ''}
          onChange={e => setDiffEmail(e.target.value !== user.email)}
          className='w-full'
          error={emailError}
        />
        {diffEmail && (
          <Button
            formAction={sendEmailCode}
            variant={'success'}
            disabled={isEmailPending}
          >
            {didSendCode ? 'Resend' : 'Send'} Verify Code!
          </Button>
        )}
      </div>
      {didSendCode && (
        <div className='mb-7 flex items-end gap-3'>
          <LabelInput
            label='Email change code(until 2 min)'
            type='text'
            name='emailChangeCode'
            placeholder='input code...'
          />
          <Button
            formAction={sendEmailCode}
            variant={'success'}
            disabled={isEmailPending}
          >
            Confirm Code
          </Button>
        </div>
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
    </form>
  );
}
