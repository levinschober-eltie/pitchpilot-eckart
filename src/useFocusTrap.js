import { useEffect, useRef } from "react";

/**
 * Traps keyboard focus within a container element.
 * Focuses the first focusable element on mount.
 * Returns a ref to attach to the container.
 */
export default function useFocusTrap() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusables = () =>
      [...container.querySelectorAll(focusableSelector)].filter(
        (el) => !el.closest('[style*="display: none"], [style*="display:none"]')
      );

    // Focus first focusable element on mount
    const focusables = getFocusables();
    if (focusables.length > 0) {
      setTimeout(() => focusables[0].focus(), 50);
    }

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const currentFocusables = getFocusables();
      if (currentFocusables.length === 0) return;

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, []);

  return ref;
}
