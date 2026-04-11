import { useEffect, useLayoutEffect, useRef, useState } from "react";

type UseSlidingIndicatorOptions = {
  activeIndex: number;
  selector?: string;
};

type IndicatorStyle = {
  left: number;
  width: number;
};

const DEFAULT_STYLE: IndicatorStyle = {
  left: 0,
  width: 0,
};

export function useSlidingIndicator({
  activeIndex,
  selector = "button",
}: UseSlidingIndicatorOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>(DEFAULT_STYLE);

  const refreshIndicator = () => {
    if (!containerRef.current || activeIndex < 0) {
      setIndicatorStyle(DEFAULT_STYLE);
      return;
    }

    const items = containerRef.current.querySelectorAll<HTMLElement>(selector);
    const activeItem = items[activeIndex];

    if (!activeItem) {
      setIndicatorStyle(DEFAULT_STYLE);
      return;
    }

    setIndicatorStyle({
      left: activeItem.offsetLeft,
      width: activeItem.offsetWidth,
    });
  };

  useLayoutEffect(() => {
    refreshIndicator();
  }, [activeIndex, selector]);

  useEffect(() => {
    window.addEventListener("resize", refreshIndicator);
    return () => window.removeEventListener("resize", refreshIndicator);
  }, [activeIndex, selector]);

  return {
    containerRef,
    indicatorStyle,
    refreshIndicator,
  };
}
