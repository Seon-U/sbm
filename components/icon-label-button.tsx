'use client';

import type { JSX, MouseEvent, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import IconLabel, { type IconNoti } from './icon-label';
import ToolTip from './tool-tip';
import { Button } from './ui/button';

type Props = {
  icon: JSX.Element;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  isDanger?: boolean;
  tooltip?: string;
  disabled?: boolean;
  noti?: IconNoti;
};

export default function IconLabelButton({
  icon,
  onClick,
  isActive,
  isDanger,
  tooltip,
  disabled,
  noti,
  children,
}: PropsWithChildren<Props>) {
  return (
    <ToolTip
      content={tooltip}
      disabled={!tooltip}
      variant={isDanger ? 'destructive' : 'default'}
    >
      <Button
        onClick={onClick}
        variant={'ghost'}
        disabled={disabled}
        className={cn(
          'h-[80%] px-1 py-1 dark:hover:bg-muted-foreground/30',
          isDanger && 'text-destructive',
          { 'px-2': !children },
          !noti ? 'px-2' : 'px-1 py-1'
        )}
      >
        <IconLabel
          icon={icon}
          isActive={isActive}
          isDanger={isDanger}
          noti={noti}
        >
          {children}
        </IconLabel>
      </Button>
    </ToolTip>
  );
}
