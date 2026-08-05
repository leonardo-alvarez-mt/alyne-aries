/**
 * Products the shell knows about. This prototype ships Alyne only, so the
 * product switcher has a single entry and `activeProductId` never changes.
 */
export const products = [
  {
    id: 'alyne',
    name: 'Alyne',
    tagline: 'Risk Management',
    iconLabel: 'ALY',
    url: '#',
    logoSrc: '/product-logos/alyne.svg',
    iconSrc: '/product-icons/alyne.svg',
    isCurrent: true,
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}
