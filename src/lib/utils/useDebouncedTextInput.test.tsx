import { act, renderHook } from "@testing-library/react";
import { useDebouncedTextInput } from "./useDebouncedTextInput";

describe("useDebouncedTextInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces local text changes before notifying the parent", () => {
    const onDebouncedChange = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedTextInput({
        value: "",
        delay: 300,
        onDebouncedChange,
      }),
    );

    act(() => {
      result.current.setValue("Heat");
    });

    expect(result.current.value).toBe("Heat");
    expect(onDebouncedChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDebouncedChange).toHaveBeenCalledWith("Heat");
    expect(result.current.value).toBe("Heat");
  });

  it("syncs external value changes into the local input state", () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebouncedTextInput({
          value,
          delay: 300,
          onDebouncedChange: vi.fn(),
        }),
      {
        initialProps: { value: "Initial" },
      },
    );

    expect(result.current.value).toBe("Initial");

    rerender({ value: "Updated externally" });

    expect(result.current.value).toBe("Updated externally");
  });
});
