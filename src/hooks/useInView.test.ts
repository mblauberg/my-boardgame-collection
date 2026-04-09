import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInView } from './useInView';

describe('useInView', () => {
  it('should return ref and isInView state', () => {
    const { result } = renderHook(() => useInView());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.isInView).toBe(false);
  });
});
