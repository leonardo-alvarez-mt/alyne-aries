/**
 * Derives breadcrumb trails from the navigation model (`src/data/navigation.js`),
 * so every page gets a hierarchical, navigable trail without hand-writing one
 * per route.
 *
 * The nav model is the single source of truth for the hierarchy: a nav item's
 * ancestors in `productNavSections` are its breadcrumb ancestors, and its
 * `path` is its destination. Nothing here is specific to any one page.
 *
 * The prototype is mounted at the router root, so a nav `path` is already a
 * route (in Chrome Shell these were relative to a `/chrome-shell` prefix).
 */

import { productNavSections, primaryNavSections } from '../data/navigation';
import { getProductById } from '../data/products';

/** Route of the product home page. */
const HOME_PATH = '/';

/** Nav entries that are affordances rather than pages (e.g. the "More" flyout). */
function isAffordance(node) {
  return node.flyout === true || node.path === '#';
}

/** Nav `path` -> router destination. Returns undefined when the node has no page. */
export function toShellHref(navPath) {
  if (!navPath || navPath === '#') return undefined;
  return navPath;
}

/** Location pathname -> nav-relative path. */
export function toNavPath(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return clean || HOME_PATH;
}

/** "control-sets" -> "Control Sets". Fallback label for segments the nav model doesn't cover. */
function humanize(segment) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Depth-first search for `targetPath`, returning the matched node and its ancestors. */
function findChain(nodes, targetPath, ancestors = []) {
  for (const node of nodes) {
    const chain = [...ancestors, node];
    if (node.path && node.path !== '#' && node.path === targetPath) return chain;
    if (node.children) {
      const found = findChain(node.children, targetPath, chain);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the deepest nav entry covering `navPath`, trimming trailing segments
 * until something matches. A detail route such as `/governance/control-sets/42`
 * resolves to the `/governance/control-sets` entry with `/42` left over.
 */
function resolveChain(sections, navPath) {
  const roots = sections.flatMap((section) => section.items ?? []);
  let candidate = navPath;

  while (candidate && candidate !== '/') {
    const chain = findChain(roots, candidate);
    if (chain) return { chain, remainder: navPath.slice(candidate.length) };
    const cut = candidate.lastIndexOf('/');
    if (cut <= 0) break;
    candidate = candidate.slice(0, cut);
  }

  const rootChain = findChain(roots, '/');
  return { chain: navPath === '/' && rootChain ? rootChain : [], remainder: navPath === '/' ? '' : navPath };
}

/** The product's home entry — its `/` nav item, else a label from the product record. */
function rootCrumb(sections, productId) {
  const home = findChain(sections.flatMap((section) => section.items ?? []), '/');
  if (home) return { label: home[home.length - 1].label, href: HOME_PATH };

  const product = getProductById(productId);
  return { label: product?.breadcrumbRoot ?? product?.name ?? 'Home', href: HOME_PATH };
}

/** Normalises a caller-supplied trailing crumb, which may be a bare string. */
function toCrumb(entry) {
  if (typeof entry === 'string') return { label: entry };
  return { label: entry.label, href: entry.href };
}

/**
 * Builds the breadcrumb trail for a location.
 *
 * Every crumb carries both a label and, where the hierarchy has a page for it,
 * an `href`. The final crumb is the current page and never carries one.
 *
 * @param {Object}   options
 * @param {string}   options.pathname          Current router pathname.
 * @param {string}   options.productId         Active product (selects the nav tree).
 * @param {Array}    [options.trailing]        Crumbs for segments below the nav model,
 *                                             e.g. `[{ label: 'Anti-Bribery & Corruption' }]`
 *                                             for a record detail page. Strings are accepted.
 * @returns {{ label: string, href?: string }[]}
 */
export function resolveBreadcrumbs({ pathname, productId, trailing }) {
  const navPath = toNavPath(pathname);

  const sections = productNavSections[productId] ?? primaryNavSections;
  const { chain, remainder } = resolveChain(sections, navPath);

  const crumbs = [];
  const home = rootCrumb(sections, productId);
  if (chain[0]?.path !== '/') crumbs.push(home);

  for (const node of chain) {
    if (isAffordance(node)) continue;
    crumbs.push({ label: node.label, href: toShellHref(node.path) });
  }

  if (trailing?.length) {
    crumbs.push(...trailing.map(toCrumb));
  } else if (remainder) {
    // No caller-supplied label for the leftover segments — fall back to the URL.
    let href = chain.length ? chain[chain.length - 1].path : '';
    for (const segment of remainder.split('/').filter(Boolean)) {
      href = `${href}/${segment}`;
      crumbs.push({ label: humanize(segment), href: toShellHref(href) });
    }
  }

  if (!crumbs.length) crumbs.push(home);

  // The current page is the last crumb and is never a link.
  const last = crumbs[crumbs.length - 1];
  crumbs[crumbs.length - 1] = { label: last.label };

  return crumbs;
}
