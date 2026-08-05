/** Prefix a public-folder path with the Vite base URL (for GitHub Pages subpaths). */
export function publicPath(path) {
  if (!path || /^(?:https?:|data:|blob:)/.test(path)) return path;

  const base = import.meta.env.BASE_URL;
  if (base !== '/' && path.startsWith(base)) return path;

  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}
