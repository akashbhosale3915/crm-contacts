import { useCallback, useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

export function useTruncatedTooltip(
  elementRef: RefObject<HTMLElement | null>,
  text: string,
  focusable = true,
) {
  const [isTruncated, setIsTruncated] = useState(false);

  const measure = useCallback(() => {
    const anchor = elementRef.current;
    if (!anchor) return;
    const element = anchor.firstElementChild ?? anchor;
    if (!(element instanceof HTMLElement)) return;
    setIsTruncated(
      element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
    );
  }, [elementRef]);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild instanceof HTMLElement) {
      observer.observe(element.firstElementChild);
    }
    return () => observer.disconnect();
  }, [elementRef, measure, text]);

  return {
    "data-tooltip": isTruncated ? text : undefined,
    tabIndex: focusable && isTruncated ? 0 : undefined,
    onMouseEnter: measure,
    onFocus: measure,
  };
}
