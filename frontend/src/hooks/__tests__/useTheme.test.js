/**
 * useTheme Hook 测试
 * 测试主题管理Hook的功能
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from '@jest/globals';
import { ThemeProvider, useTheme } from '../useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
global.matchMedia = matchMediaMock;

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: vi.fn(),
  },
  writable: true,
});

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    document.documentElement.setAttribute.mockClear();
  });

  test('应该抛出错误当在Provider外使用时', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });

  test('应该使用localStorage中保存的主题', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.isLight).toBe(false);
  });

  test('应该使用系统偏好当localStorage为空时', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('dark');
  });

  test('应该默认使用light主题', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('light');
  });

  test('toggleTheme应该在light和dark之间切换', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('setLightTheme应该设置为light主题', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setLightTheme();
    });
    
    expect(result.current.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('setDarkTheme应该设置为dark主题', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setDarkTheme();
    });
    
    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('setSystemTheme应该移除localStorage并使用系统主题', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setSystemTheme();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme');
    expect(result.current.theme).toBe('dark');
  });

  test('应该设置document的data-theme属性', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    renderHook(() => useTheme(), { wrapper });
    
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});