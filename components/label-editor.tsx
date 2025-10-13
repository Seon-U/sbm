'use client';
import { CheckLineIcon, SaveIcon } from 'lucide-react';
import {
  type ComponentProps,
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
import { cn } from '@/lib/utils';
import type { ValidError } from '@/lib/validator';
import LabelInput, { type LabelInputProps } from './label-input';
import { Button } from './ui/button';

type Props = {
  saveAction: (formData: FormData) => Promise<ValidError | undefined>;
};

export default function LabelEditor({
  saveAction,
  label,
  type,
  name,
  ref,
  focus,
  defaultValue,
  error,
  placeholder,
  className,
  inputClassName,
  ...props
}: ComponentProps<'input'> & LabelInputProps & Props) {
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setDirty] = useState(false);
  const [validError, setValidError] = useState<ValidError | undefined>(
    undefined
  );
  const [isPending, startTransition] = useTransition();

  // const [validError, submitAction, isPending] = useActionState(
  //   async (_: ValidError | undefined, formData: FormData) => {
  //     const err = await saveAction(formData);
  //     if (err) return err;
  //     setDirty(false);
  //   },
  //   undefined
  // );

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const err = await saveAction(formData);
      if (err) setValidError(err);
      else setDirty(false);
    });
  };

  return (
    <form
      onSubmit={submitHandler}
      onResetCapture={() => setDirty(false)}
      className='flex flex-nowrap gap-3'
    >
      <LabelInput
        label={label}
        type={type}
        name={name}
        ref={ref || labelInputRef}
        focus={focus}
        defaultValue={defaultValue}
        error={error || validError}
        placeholder={placeholder}
        className={cn(className, 'w-full')}
        inputClassName={inputClassName}
        onKeyUp={e => {
          e.stopPropagation();
          console.log('🚀 ~ e:', defaultValue, e.currentTarget.value);
          setDirty(defaultValue !== e.currentTarget.value);
        }}
        onChange={e => {
          // console.log('🚀 ~ e:', defaultValue, e.target.value);
          setDirty(defaultValue !== e.target.value);
        }}
        {...props}
      />
      {isDirty && (
        <div className='flex items-end gap-2'>
          <Button type='reset' variant={'outline'}>
            <CheckLineIcon />
          </Button>
          <Button type='submit' variant={'primary'} disabled={isPending}>
            <SaveIcon />
          </Button>
        </div>
      )}
    </form>
  );
}
