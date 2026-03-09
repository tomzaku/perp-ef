import { createContext, useContext } from 'react';
import type { Theme } from './useTheme.ts';

export const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}
