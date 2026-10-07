import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever a user navigates between pages or route queries,
 * the viewport immediately resets to the very top (0, 0), matching traditional website
 * navigation and preventing SPA scroll-retention issues.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration on SPA navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Instantly scroll window to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Cross-browser fallbacks
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
