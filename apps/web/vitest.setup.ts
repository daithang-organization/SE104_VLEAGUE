import '@testing-library/jest-dom/vitest';

// Initialize i18n for tests — force Vietnamese, skip LanguageDetector
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './src/locales/vi';

i18n.use(initReactI18next).init({
  lng: 'vi',
  resources: { vi: { translation: vi } },
  interpolation: { escapeValue: false },
});

// Ant Design Tabs/Collapse and other components use ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Ant Design and some components use window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
