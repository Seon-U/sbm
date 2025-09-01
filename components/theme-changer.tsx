'use client';

import { MonitorIcon, MoonStar, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

//readonly처리를 위
const THEMES = ['light', 'system', 'dark'] as const;
const THEME_ICONS = {
  light: <MonitorIcon />,
  system: <MoonStar />,
  dark: <SunIcon />,
};

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
    return () => {};
  }, []);
  if (!mount || !theme) return <button></button>;
  const changeTheme = () => {
    const idx = THEMES.indexOf(theme as keyof typeof THEME_ICONS) + 1;
    setTheme(THEMES[idx % THEMES.length]);
  };

  return (
    <button onClick={changeTheme} className='btn-icon'>
      {THEME_ICONS[theme as keyof typeof THEME_ICONS]}
    </button>
  );
}
