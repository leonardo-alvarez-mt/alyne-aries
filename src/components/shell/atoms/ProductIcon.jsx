import { cn } from '../../../utils/cn';
import { getProductById } from '../../../data/products';
import { publicPath } from '../../../lib/publicPath';

export function ProductIcon({ productId, iconSrc, alt, className, size = 34 }) {
  const product = productId ? getProductById(productId) : null;
  const src = iconSrc ?? product?.iconSrc;
  if (!src) return null;

  return (
    <img
      src={publicPath(src)}
      alt={alt ?? `${product?.name ?? 'Product'} icon`}
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      draggable={false}
    />
  );
}
