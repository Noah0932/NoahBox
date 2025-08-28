/**
 * ThemeToggle 组件测试
 * 测试主题切换组件的功能和交互
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from '@jest/globals';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../hooks/useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const ThemeToggleWithProvider = ({ children, ...props }) => (
  <ThemeProvider>
    <ThemeToggle {...props} />
    {children}
  </ThemeProvider>
);

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('应该渲染主题切换按钮', () => {
    render(<ThemeToggleWithProvider />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title');
  });

  test('应该显示正确的主题图标', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(<ThemeToggleWithProvider />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('☀️');
  });

  test('应该在点击时切换主题', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(<ThemeToggleWithProvider />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  test('应该应用自定义className', () => {
    render(<ThemeToggleWithProvider className="custom-class" />);
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('theme-toggle', 'custom-class');
  });

  test('应该在鼠标悬停时改变样式', () => {
    render(<ThemeToggleWithProvider />);
    
    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);
    expect(button.style.transform).toBe('scale(1.05)');
    
    fireEvent.mouseLeave(button);
    expect(button.style.transform).toBe('scale(1)');
  });

  test('应该支持深色主题', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<ThemeToggleWithProvider />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('🌙');
  });
});