'use client';

import type { JSX, MouseEvent, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import IconLabel from './icon-label';
import ToolTip from './tool-tip';
import { Button } from './ui/button';

type Props = {
  icon: JSX.Element;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  isDanger?: boolean;
  tooltip?: string;
  disabled?: boolean;
};

export default function IconLabelButton({
  icon,
  onClick,
  isActive,
  isDanger,
  tooltip,
  disabled,
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
          { 'px-2': !children }
        )}
      >
        <IconLabel icon={icon} isActive={isActive} isDanger={isDanger}>
          {children}
        </IconLabel>
      </Button>
    </ToolTip>
  );
}
