import { cn } from '../../../utils/cn';
import { publicPath } from '../../../lib/publicPath';

export function ProductLogo({ product, className }) {
  if (!product?.logoSrc) return null;

  return (
    <div className={cn('shrink-0 py-3', className)}>
      <img
        src={publicPath(product.logoSrc)}
        alt={`${product.name} logo`}
        className="max-h-9 w-auto object-contain object-left"
        draggable={false}
      />
    </div>
  );
}
