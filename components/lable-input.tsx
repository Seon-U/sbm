import { type ComponentProps, type RefObject, useId } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

type Props = {
  label: string;
  type?: string;
  name?: string;
  ref?: RefObject<HTMLInputElement | null>;
  placeholder?: string;
  className?: string;
};

export default function LabelInput({
  label,
  type,
  name,
  ref,
  placeholder,
  className,
  ...props
}: Props & ComponentProps<'input'>) {
  const uniqName = useId();

  return (
    <label htmlFor={uniqName} className='font-semibold text-sm capitalize'>
      {label}
      <Input
        id={uniqName}
        name={name || uniqName}
        type={type || 'text'}
        ref={ref}
        placeholder={placeholder || ''}
        className={cn('bg-gray-100 font-normal focus:bg-white', className)}
        {...props}
      />
    </label>
  );
}
