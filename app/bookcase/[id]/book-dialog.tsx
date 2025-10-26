'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useActionState, useState } from 'react';
import CheckSwitch from '@/components/check-switch';
import LabelInput from '@/components/label-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAlerter } from '@/hooks/contexts/alerter';
import type { BookData } from '@/lib/db';
import type { ValidError } from '@/lib/validator';
import { deleteBook, saveBook } from './book.action';

export default function BookDialog({
  book = {
    id: 0,
    title: '',
    ispublic: false,
    withdel: false,
    remark: '',
    member: 0,
  },
  children,
}: PropsWithChildren<{
  book?: BookData;
}>) {
  const { confirm, alert, prompt } = useAlerter();
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  // const [ispublic, setPublic] = useState(book.ispublic);
  // const [withdel, setWithdel] = useState(book.withdel);

  const [validError, save, isPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      // formData.set('ispublic', ispublic ? 'on' : '');
      formData.set('id', String(book.id));
      const err = await saveBook(formData);
      if (err) {
        // setPublic(!!err.ispublic.value);
        // setWithdel(!!err.withdel.value);
        return err;
      }

      router.refresh();
      setOpen(false);
    },
    undefined
  );

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   console.log('xxxxxxxx>>', book, validError);
  //   if (book) {
  //     // setPublic(book.ispublic || !!validError?.ispublic?.value);
  //     // setWithdel(book.withdel || !!validError?.withdel?.value);
  //   }
  // }, [validError]);

  const remove = async () => {
    const ret = await confirm({ title: 'Are you sure?' });
    if (!ret) return;

    const code = await prompt({
      title: 'Inout the code?',
      description: 'Input the code to delete this book.',
      placeholder: 'code..',
    });

    if (code !== '1234') {
      await alert({ title: 'Not valid code!', variant: 'destructive' });
      return;
    }

    const err = await deleteBook(book.id);
    if (err) {
      console.log('Err>>', err.id.errors[0]);
      await alert({ title: err.id.errors[0], okText: 'Confirm' });
      setOpen(false);
      return;
    }
    router.refresh();
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form action={save}>
          <DialogHeader>
            <DialogTitle>{book.id ? 'Create' : 'Edit'} Book</DialogTitle>
            <DialogDescription>descript...</DialogDescription>
          </DialogHeader>

          <div className='mt-5 space-y-5'>
            <LabelInput
              label='title'
              name='title'
              error={validError}
              defaultValue={book.title}
            />

            {/* <div className='flex items-center gap-3'>
              <Checkbox
                id='ispublic'
                name='ispublic'
                checked={ispublic}
                onCheckedChange={checked => setPublic(!!checked)}
                // defaultChecked={book.ispublic}
              />
              <Label htmlFor='ispublic' className='cursor-pointer'>
                Public {ispublic && 'XX'}
              </Label>
            </div> */}
            <CheckSwitch
              name='ispublic'
              label='Public Book'
              error={validError}
              checkValue={book.ispublic}
            />
            <CheckSwitch
              name='withdel'
              label='Open with deletion'
              type='switch'
              error={validError}
              checkValue={book.withdel}
            />
            {/* <div> 
              <div className='flex items-center gap-3'>
                 <Switch
                  id='withdel'
                  name='withdel'
                  checked={withdel}
                  onCheckedChange={checked => setWithdel(!!checked)}
                  defaultChecked={book.withdel || !!validError?.withdel.value}
                />
                <Label htmlFor='withdel'>
                  Open with deletion: {!!validError?.withdel?.value && 'xx'}
                </Label> 
              </div>

              <p className='mt-1 text-red-500 text-sm'>
                {validError?.withdel?.errors[0]}
              </p>
            </div>*/}

            <div className='flex flex-col'>
              <Label
                htmlFor='remark'
                className='font-semibold text-sm capitalize'
              >
                Description
              </Label>

              <Textarea
                placeholder='description...'
                id='remark'
                name='remark'
                defaultValue={book.remark ?? ''}
              />
            </div>
          </div>

          <DialogFooter className='mt-5'>
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            {!!book.id && (
              <Button variant={'destructive'} onClick={remove} type='button'>
                Delete
              </Button>
            )}
            <Button type='submit' disabled={isPending}>
              {book.id ? 'Save' : 'Create'} Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
