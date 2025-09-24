import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
import type prisma from '@/lib/db';
import { cn } from '@/lib/utils';
import type { ValidError } from '@/lib/validator';

type Props = {
  src: string | StaticImageData;
  alt?: string;
  // changeImage?: (
  //   formData: FormData
  // ) => Promise<
  //   [ValidError, null] | [null, typeof prisma.member | null] | [Error, null]
  // >;
  changeImage?: (
    formData: FormData
  ) => Promise<[ValidError, typeof prisma.member]>;
};

export default function ImageUploader({ src, alt, changeImage }: Props) {
  const { update } = useSession();
  const [isDragging, setDragging] = useState(false);
  const [img, setImg] = useState(src);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const setImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPreview(e.target.files[0]);
  };

  const setPreview = (file: File) => {
    console.log('🚀 ~ file:', file);
    const reader = new FileReader();
    reader.onload = e => {
      console.log('🚀 ~ e:', e.target?.result);
      if (e.target) setImg(e.target.result as string);
      formRef.current?.requestSubmit();
    };
    reader.readAsDataURL(file);
  };

  const [isPending, startTransition] = useTransition();

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      const ent = Object.fromEntries(formData.entries());
      console.log('🚀 ~ ent:', ent);
      if (!changeImage) return;
      const [err, mbr] = await changeImage(formData);
      if (err) return alert(err);
      update(mbr);
    });
  };

  return (
    <form onSubmit={submitHandler} ref={formRef} className='w-full'>
      {/** biome-ignore lint/a11y/noStaticElementInteractions: file attach */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const files = e.dataTransfer.files;
          if (files?.length) setPreview(files[0]);
        }}
        className={cn(
          'relative aspect-square w-full cursor-pointer rounded-full border-2 shadow-sm',
          { 'border-blue-500 border-dotted': isDragging }
        )}
      >
        <Image
          src={img}
          alt={alt || ''}
          // width={150}
          // height={150}
          onClick={() => fileRef.current?.click()}
          className='rounded-full border'
          fill
        />

        {/* <Img src={img as string} /> */}

        <input
          type='file'
          name='image'
          ref={fileRef}
          accept='image/*'
          onChange={setImageFile}
          disabled={isPending}
          hidden
        />
      </div>
    </form>
  );
}
