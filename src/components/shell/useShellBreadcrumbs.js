import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBreadcrumbs } from '../../lib/shellBreadcrumbs';
import { useShell } from './ShellContext';

/**
 * Breadcrumb trail for the current shell location, derived from the navigation
 * model. Pages only need to supply `trailing` when the leaf isn't in the nav
 * tree (record detail pages, where the label comes from the record itself).
 *
 * @param {Array} [trailing] Extra leaf crumbs, e.g. `[{ label: set.name }]`.
 */
export function useShellBreadcrumbs(trailing) {
  const { pathname } = useLocation();
  const { activeProductId } = useShell();

  // `trailing` is usually an inline literal; key the memo on its contents.
  const trailingKey = JSON.stringify(trailing ?? null);

  return useMemo(
    () => resolveBreadcrumbs({ pathname, productId: activeProductId, trailing }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, activeProductId, trailingKey]
  );
}
