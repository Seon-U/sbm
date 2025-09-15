'use client';

import { LoaderPinwheelIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useReducer } from 'react';
import z from 'zod';
import LabelInput from '@/components/lable-input';
import { Button } from '@/components/ui/button';
import type { ValidError } from '@/lib/validator';
import { authorize } from './sign.action';

export default function SignForm() {
  const [isSignin, toggleSign] = useReducer(pre => !pre, false);
  return (
    <>
      {isSignin ? (
        <SignIn toggleSign={toggleSign} />
      ) : (
        <SignUp toggleSign={toggleSign} />
      )}
    </>
  );
}

function SignIn({ toggleSign }: { toggleSign: () => void }) {
  const makeLogin = async (formData: FormData) => {
    // const email = formData.get('email');
    // const passwd = formData.get('passwd');

    // const validator = z
    //   .object({
    //     email: z.email('잘못된 이메일 형식입니다'),
    //     passwd: z.string().min(6, '6글자 이상 입력하시오'),
    //   })
    //   .safeParse(Object.fromEntries(formData.entries()));

    // if (!validator.success) {
    //   console.log('Error:', validator.error);
    //   return alert(validator.error);
    // }

    await authorize(formData);
  };
  return (
    <>
      <form action={makeLogin} className='flex flex-col space-y-3'>
        <LabelInput
          label='email'
          type='email'
          name='email'
          defaultValue={'jeonseongho@naver.com'}
          placeholder='email@bookmark.com'
        />
        <LabelInput
          label='password'
          type='password'
          name='passwd'
          defaultValue={'121212'}
          placeholder='your password...'
          className='my-3x'
        />
        <div className='flex justify-between'>
          <label htmlFor='remeber' className='cursor-pointer'>
            <input
              type='checkbox'
              id='remeber'
              className='mr-1 translate-y-{1px}'
            />
            Remember me
          </label>

          <Link href='#'>Forgot Password?</Link>
        </div>

        <Button type='submit' variant={'primary'} className='w-full'>
          Sign In
        </Button>
      </form>
      <div className='mt-5 flex gap-10'>
        <span>Dont&apos;t have Account?</span>
        <Link onClick={toggleSign} href='#'>
          Sign up
        </Link>
      </div>
    </>
  );
}

function SignUp({ toggleSign }: { toggleSign: () => void }) {
  const [validator, makeRegist, isPending] = useActionState(
    async (_preValidError: ValidError | undefined, formData: FormData) => {
      const validator = z
        .object({
          email: z.email(),
          passwd: z.string().min(6),
          passwd2: z.string().min(6),
          nickname: z.string().min(3),
        })
        .refine(
          ({ passwd, passwd2 }) => passwd === passwd2,
          'passwords are not matched'
        )
        .safeParse(Object.fromEntries(formData.entries()));

      if (!validator.success) {
        const err = z.treeifyError(validator.error);
        return err;
      }
    },
    undefined
  );
  return (
    <>
      <form action={makeRegist} className='flex flex-col space-y-2'>
        <LabelInput
          label='email'
          type='email'
          name='email'
          error={validError}
          placeholder='email@bookmark.com'
        />
        <LabelInput
          label='password'
          type='password'
          name='passwd'
          error={validError}
          placeholder='your password...'
          className='my-3x'
        />
        <LabelInput
          label='password confirm'
          type='password'
          name='passwd2'
          error={validError}
          placeholder='your password..'
          className='my-3x'
        />
        <LabelInput
          label='nickname'
          type='text'
          name='nickname'
          error={validError}
          placeholder='your nickname..'
          className='my-3x'
        />

        <Button
          type='submit'
          variant={'primary'}
          disabled={isPending}
          className='w-full'
        >
          {isPending ? 'Signing Up...' : 'Sign up'}
          {isPending && <LoaderPinwheelIcon className='animate-spin' />} Sign Up
        </Button>
      </form>
      <div className='mt-5 flex gap-10'>
        <span>Already have Account?</span>
        <Link onClick={toggleSign} href='#'>
          Sign In
        </Link>
      </div>
    </>
  );
}
