import { renderHook, act } from '@testing-library/react-hooks';
import useModal from 'lib/hooks/useModal';

describe('useModal CustomHook', () => {
  it('should check true initial values', () => {
    let initialValue = true;
    const { result, rerender } = renderHook(() => useModal(initialValue));
    expect(result.current.isOpen).toBe(initialValue);
    initialValue = false;
    rerender();
    // because state is in useState
    expect(result.current.isOpen).not.toBe(initialValue);
  });

  it('should check false initial values', () => {
    let initialValue = false;
    const { result, rerender } = renderHook(() => useModal(initialValue));
    expect(result.current.isOpen).toBe(initialValue);

    initialValue = true;
    rerender();
    // because state is in useState
    expect(result.current.isOpen).not.toBe(initialValue);
  });

  it('should check setOpen function', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBeFalsy();
    act(() => {
      result.current.setOpen();
    });
    expect(result.current.isOpen).toBeTruthy();
  });

  it('should check setClose function', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBeFalsy();
    act(() => {
      result.current.setOpen();
    });

    expect(result.current.isOpen).toBeTruthy();

    act(() => {
      result.current.setClose();
    });
    expect(result.current.isOpen).toBeFalsy();
  });

  it('should check setToggle function', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBeFalsy();
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBeTruthy();

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBeFalsy();
  });
});
