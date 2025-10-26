'use client';

import { useSession } from 'next-auth/react';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { likesAndReports } from '@/app/bookcase/[id]/book.action';

type ContextValueProps = {
  iLikedMarks: number[];
  iReportedMarks: number[];
  // setMarks: (likes: number[], reports: number[]) => void;
};

const StoreContext = createContext<ContextValueProps>({
  iLikedMarks: [],
  iReportedMarks: [],
  // setMarks: (likes:number[], reports:number[]) => void,
});

export function StoreProvider({ children }: PropsWithChildren) {
  const [iLikedMarks, setLikedMarks] = useState<number[]>([]);
  const [iReportedMarks, setReportedMarks] = useState<number[]>([]);
  const { data: session } = useSession();

  const setMarks = useCallback((likes: number[], reports: number[]) => {
    // console.log( '~likes/reports:' likes, reports);

    setLikedMarks(likes);
    setReportedMarks(reports);
  }, []);

  useEffect(() => {
    if (session?.user) {
      likesAndReports(Number(session.user.id)).then(res => {
        // [[{id: 1}, {id: 2}], [{id: 1}]]
        const [likes, reports] = res;
        setMarks(
          likes.map(({ id }) => id),
          reports.map(({ id }) => id)
        );
      });
    }
  }, [session?.user, setMarks]);

  return (
    <StoreContext.Provider value={{ iLikedMarks, iReportedMarks }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => use(StoreContext);
