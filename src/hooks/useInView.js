import { useEffect, useRef, useState } from 'react';

/**
 * Observa quando um elemento entra no viewport. Usado para lazy-load
 * de iframes de preview dos ads (cada iframe carrega uma página da Meta,
 * então só renderizar quando visível economiza muito).
 */
export function useInView({ rootMargin = '200px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true); // SSR / fallback
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, inView];
}
