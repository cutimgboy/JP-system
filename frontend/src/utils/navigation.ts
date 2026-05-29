import type { NavigateFunction, NavigateOptions, To } from 'react-router-dom';

export function canNavigateBackWithinApp() {
  if (typeof window === 'undefined') return false;
  const historyState = window.history.state as { idx?: number } | null;
  return typeof historyState?.idx === 'number' && historyState.idx > 0;
}

export function goBackOrNavigate(navigate: NavigateFunction, fallback: To, options?: NavigateOptions) {
  if (canNavigateBackWithinApp()) {
    navigate(-1);
    return;
  }

  navigate(fallback, { replace: true, ...options });
}
