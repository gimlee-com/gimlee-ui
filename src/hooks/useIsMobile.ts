import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 960;

/**
 * Returns `true` when the viewport is narrower than UIkit's medium breakpoint (960 px).
 * Re-evaluates on window resize.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
