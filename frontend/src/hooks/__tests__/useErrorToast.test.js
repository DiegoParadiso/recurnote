import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useErrorToast from '../useErrorToast';

describe('useErrorToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty error toast', () => {
    const { result } = renderHook(() => useErrorToast());
    expect(result.current.errorToast).toBe('');
  });

  it('should show error message', () => {
    const { result } = renderHook(() => useErrorToast());

    act(() => {
      result.current.showError('Test error message');
    });

    expect(result.current.errorToast).toBe('Test error message');
  });

  it('should clear error after duration', () => {
    const { result } = renderHook(() => useErrorToast(1000));

    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.errorToast).toBe('Test error');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.errorToast).toBe('');
  });

  it('should clear error manually', () => {
    const { result } = renderHook(() => useErrorToast());

    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.errorToast).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.errorToast).toBe('');
  });

  it('should use custom duration', () => {
    const customDuration = 5000;
    const { result } = renderHook(() => useErrorToast(customDuration));

    act(() => {
      result.current.showError('Test error');
    });

    // No debe desaparecer antes del tiempo
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.errorToast).toBe('Test error');

    // Debe desaparecer después del tiempo
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.errorToast).toBe('');
  });
});
