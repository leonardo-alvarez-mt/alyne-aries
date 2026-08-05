/**
 * Nav-path helpers.
 *
 * In Chrome Shell the shell was mounted under a `/chrome-shell` prefix and nav
 * `path`s were relative to it. Here the prototype *is* the app and sits at the
 * router root, so a nav `path` is already a route and the mapping is identity.
 * The function names are kept so shell components read the same in both repos.
 *
 * Note: routes are relative to the router basename, which Vite's `BASE_URL`
 * supplies (`/alyne-prototype/` on GitHub Pages). React Router prepends it, so
 * nothing here needs to know about the deployment subpath.
 */

/** The prototype is mounted at the router root. */
export const SHELL_BASE = '';

/** Every route in this app is a shell route. */
export function isInShell() {
  return true;
}

/** Nav data path -> app route. Identity here; see module note. */
export function toShellPath(navPath) {
  return navPath;
}

export function isShellNavActive(navPath, pathname) {
  if (navPath === '/') return pathname === '/';
  return pathname === navPath || pathname.startsWith(`${navPath}/`);
}

export function resolveNavPath(navPath) {
  return navPath;
}

export function matchNavPath(navPath, pathname) {
  return isShellNavActive(navPath, pathname);
}

/** Normalize an item's children into labelled groups of leaf items.
 *  Supports three shapes: explicit `flyoutGroups`, nested `children`
 *  (a child that itself has `children` becomes a group), or a flat list. */
export function resolveNavGroups(item) {
  const children = item.children ?? [];
  if (item.flyoutGroups?.length) {
    const childById = Object.fromEntries(children.map((c) => [c.id, c]));
    return item.flyoutGroups.map((group) => ({
      label: group.label,
      items: group.itemIds.map((id) => childById[id]).filter(Boolean),
    }));
  }
  const hasGroups = children.some((c) => c.children?.length);
  if (!hasGroups) return [{ label: null, items: children }];
  return children.map((c) =>
    c.children?.length ? { label: c.label, items: c.children } : { label: null, items: [c] }
  );
}
