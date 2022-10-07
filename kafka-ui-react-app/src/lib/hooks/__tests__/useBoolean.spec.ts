import { renderHook, act } from '@testing-library/react';
import useBoolean from 'lib/hooks/useBoolean';

describe('useBoolean CustomHook', () => {
  it('should check true initial values', () => {
    let initialValue = true;
    const { result, rerender } = renderHook(() => useBoolean(initialValue));
    expect(result.current.value).toBe(initialValue);
    initialValue = false;
    rerender();
    // because state is in useState
    expect(result.current.value).not.toBe(initialValue);
  });

  it('should check false initial values', () => {
    let initialValue = false;
    const { result, rerender } = renderHook(() => useBoolean(initialValue));
    expect(result.current.value).toBe(initialValue);

    initialValue = true;
    rerender();
    // because state is in useState
    expect(result.current.value).not.toBe(initialValue);
  });

  it('should check setTrue function', () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBeFalsy();
    act(() => {
      result.current.setTrue();
    });
    expect(result.current.value).toBeTruthy();
  });

  it('should check setFalse function', () => {
    const { result } = renderHook(() => useBoolean());

    expect(result.current.value).toBeFalsy();
    act(() => {
      result.current.setTrue();
    });

    expect(result.current.value).toBeTruthy();

    act(() => {
      result.current.setFalse();
    });
    expect(result.current.value).toBeFalsy();
  });

  it('should check setToggle function', () => {
    const { result } = renderHook(() => useBoolean());

    expect(result.current.value).toBeFalsy();
    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBeTruthy();

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toBeFalsy();
  });
});
