import { useEffect, useRef, useState } from "react";

type UseDebouncedTextInputOptions = {
  value: string;
  delay: number;
  onDebouncedChange: (value: string) => void;
};

export function useDebouncedTextInput({
  value,
  delay,
  onDebouncedChange,
}: UseDebouncedTextInputOptions) {
  const [localValue, setLocalValue] = useState(value);
  const previousExternalValueRef = useRef(value);
  const isEditingRef = useRef(false);
  const pendingSubmittedValueRef = useRef<string | null>(null);
  const onDebouncedChangeRef = useRef(onDebouncedChange);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    const previousExternalValue = previousExternalValueRef.current;
    const pendingSubmittedValue = pendingSubmittedValueRef.current;

    if (pendingSubmittedValue !== null) {
      if (value === pendingSubmittedValue) {
        pendingSubmittedValueRef.current = null;
      } else if (value !== previousExternalValue) {
        pendingSubmittedValueRef.current = null;
        isEditingRef.current = false;
        if (value !== localValue) {
          setLocalValue(value);
        }
      }
    } else if (isEditingRef.current) {
      if (value !== previousExternalValue) {
        isEditingRef.current = false;
        if (value !== localValue) {
          setLocalValue(value);
        }
      }
    } else if (value !== localValue) {
      setLocalValue(value);
    }

    previousExternalValueRef.current = value;
  }, [value, localValue]);

  useEffect(() => {
    if (!isEditingRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      isEditingRef.current = false;

      if (localValue === value) {
        return;
      }

      pendingSubmittedValueRef.current = localValue;
      onDebouncedChangeRef.current(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, value, delay]);

  return {
    value: localValue,
    setValue(nextValue: string) {
      isEditingRef.current = true;
      setLocalValue(nextValue);
    },
  };
}
