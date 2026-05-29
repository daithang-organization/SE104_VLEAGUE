import { theme, type ThemeConfig } from 'antd';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

const APP_FONT_FAMILY =
  "'Be Vietnam Pro', 'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const APP_CODE_FONT_FAMILY =
  "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('vleague-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('vleague-theme', next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, toggleTheme, isDark: mode === 'dark' }),
    [mode, toggleTheme],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Return the Ant Design algorithm for the current theme mode */
export function useAntdAlgorithm() {
  const { isDark } = useTheme();
  return isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
}

export function useAntdThemeConfig(): ThemeConfig {
  const { isDark } = useTheme();

  return useMemo<ThemeConfig>(() => {
    if (isDark) {
      return {
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#E32221',
          colorInfo: '#E32221',
          colorLink: '#E32221',
          colorLinkHover: '#ff4d4f',
          colorBgBase: '#0b1320',
          colorBgContainer: '#152238',
          colorBgElevated: '#1e2f4a',
          colorTextBase: '#f0f2f5',
          borderRadius: 8,
          fontFamily: APP_FONT_FAMILY,
          fontFamilyCode: APP_CODE_FONT_FAMILY,
        },
        components: {
          Layout: {
            bodyBg: '#0b1320',
            headerBg: '#0b1320',
            siderBg: '#001f33',
          },
          Menu: {
            darkItemBg: '#001f33',
            darkSubMenuItemBg: '#001f33',
            darkItemSelectedBg: '#c91f1f',
            darkItemSelectedColor: '#ffffff',
          },
          Card: {
            colorBorderSecondary: 'transparent',
          },
          Table: {
            headerBg: '#1a2942',
            headerSortActiveBg: '#1a2942',
            bodySortBg: '#152238',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            rowHoverBg: 'rgba(227, 34, 33, 0.15)',
          },
        },
      };
    }

    return {
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: '#dc2626',
        colorInfo: '#2563eb',
        colorSuccess: '#16a34a',
        colorWarning: '#f59e0b',
        colorError: '#dc2626',
        colorLink: '#dc2626',
        colorLinkHover: '#b91c1c',
        colorBgBase: '#f5f7fb',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorTextBase: '#0f172a',
        colorTextSecondary: '#64748b',
        colorBorder: '#e2e8f0',
        colorBorderSecondary: '#e2e8f0',
        borderRadius: 8,
        fontFamily: APP_FONT_FAMILY,
        fontFamilyCode: APP_CODE_FONT_FAMILY,
      },
      components: {
        Layout: {
          bodyBg: '#f5f7fb',
          headerBg: '#ffffff',
          siderBg: '#ffffff',
        },
        Menu: {
          itemBg: '#ffffff',
          itemSelectedBg: '#fee2e2',
          itemSelectedColor: '#dc2626',
          itemHoverColor: '#b91c1c',
          itemHoverBg: '#eef3fb',
        },
        Card: {
          colorBorderSecondary: '#e2e8f0',
        },
        Table: {
          headerBg: '#f1f5f9',
          headerSortActiveBg: '#f1f5f9',
          bodySortBg: '#ffffff',
          borderColor: '#e2e8f0',
          rowHoverBg: '#eef3fb',
        },
      },
    };
  }, [isDark]);
}
