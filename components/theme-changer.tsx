'use client';

import { MonitorIcon, MoonStar, StarIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useReducer, useState } from 'react';

//readonly처리를 위
const THEMES = ['light', 'system', 'dark'] as const;
const THEME_ICONS = {
  light: <MonitorIcon />,
  system: <MoonStar />,
  dark: <StarIcon />,
};

export default function ThemeChanger() {
  const { theme } = useTheme();
  const [isDarkMode, setTheme] = useReducer(pre => !pre, false);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    (setMount(true), []);
  });

  //나중에 off a11y해주면 됨
  if (!mount) return <button></button>;

  const changeTheme = () => {
    const idx = THEMES.indexOf(theme as keyof typeof THEME_ICONS) + 1;
    setTheme(THEMES[idx === THEMES.length ? 0 : idx]);

    return (
      <button type='button' onClick={changeTheme} className='btn-icon'>
        {THEME_ICONS[theme as keyof typeof THEME_ICONS]} {theme}
      </button>
    );
  };
}
