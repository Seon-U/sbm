'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
import type { UpdateProfileImageReturn } from '@/app/sign/sign.action';
import { cn, DummyProfile } from '@/lib/utils';

type Props = {
  src: string | StaticImageData;
  alt?: string;
  // changeImage?: (
  //   formData: FormData
  // ) => Promise<
  //   [ValidError, null] | [null, typeof prisma.member | null] | [Error, null]
  // >;
  changeImage?: (formData: FormData) => UpdateProfileImageReturn;
};

export default function ImageUploader({ src, alt, changeImage }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [isDragging, setDragging] = useState(false);
  const [img, setImg] = useState(src);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);

  const setImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPreview(e.target.files[0], true);
  };

  const setPreview = (file: File, needSubmit = false) => {
    console.log('🚀 ~ file:', file);
    const reader = new FileReader();
    reader.onload = e => {
      // console.log('🚀 ~ e:', e.target?.result);
      if (e.target) setImg(e.target.result as string);
      if (needSubmit) formRef.current?.requestSubmit();
    };
    reader.readAsDataURL(file);
  };

  const [isPending, startTransition] = useTransition();

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // console.log('***>>>', formData);
    uploadImage(formData);
  };

  const uploadImage = (formData: FormData) => {
    setErrorMsgs([]);
    startTransition(async () => {
      // const ent = Object.fromEntries(formData.entries());
      // console.log('🚀 ~ ent:', ent);
      if (!changeImage) return;
      const [err, mbr] = await changeImage(formData);
      if (err) {
        setImg(src);
        if (typeof err.image === 'object' && err.image?.errors) {
          setErrorMsgs(err.image.errors);
          return;
        }
      }
      await update(mbr);
      router.refresh();
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
          e.stopPropagation();
          setDragging(false);
          const files = e.dataTransfer.files;
          if (files?.length) setPreview(files[0]);

          const formData = new FormData();
          formData.append('image', files[0]);
          uploadImage(formData);
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
          unoptimized={process.env.NODE_ENV === 'development'}
          priority={false}
          onError={() => setImg(DummyProfile)}
        />

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
      <div>
        {errorMsgs.map(esmg => (
          <p key={esmg} className='text-red-500'>
            {esmg}
          </p>
        ))}
      </div>
    </form>
  );
}
