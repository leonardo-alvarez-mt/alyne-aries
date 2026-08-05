import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { products } from '../../../data/products';
import { useShell } from '../ShellContext';
import { ProductIcon } from '../atoms/ProductIcon';

export function ProductSwitcherMenu({ onClose }) {
  const containerRef = useRef(null);
  const { activeProductId, setActiveProductId } = useShell();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Your apps"
      style={{
        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
        width: 280, paddingTop: 24, paddingBottom: 24, paddingLeft: 16, paddingRight: 24,
        background: '#FFF', borderRadius: 8, border: '1px solid #C7D3DF',
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24,
        zIndex: 60, boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        animation: 'shellFadeIn 150ms ease-out',
      }}
    >
      <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, display: 'inline-flex', justifyContent: 'flex-start' }}>
          <div style={{ width: 72, opacity: 0.50, color: '#242A30', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '16px' }}>YOUR APPS</div>
        </div>
        {products.map((product) => (
          <a
            key={product.id}
            href={product.url}
            onClick={(e) => {
              e.preventDefault();
              setActiveProductId(product.id);
              if (product.id !== activeProductId) navigate('/');
              onClose();
            }}
            style={{
              alignSelf: 'stretch', paddingTop: 8, paddingBottom: 8, paddingRight: 8,
              borderRadius: 4, display: 'inline-flex', justifyContent: 'flex-start',
              alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8FA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
          >
            <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeProductId === product.id && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke="#2A5DB7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <ProductIcon productId={product.id} size={34} />
            <div style={{ flex: '1 1 0', display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2 }}>
              <div style={{ alignSelf: 'stretch', color: '#001A35', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{product.name}</div>
              <div style={{ alignSelf: 'stretch', color: '#6B7D8F', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{product.tagline}</div>
            </div>
          </a>
        ))}

        <div style={{ alignSelf: 'stretch', height: 1, background: '#E4EAF0', marginTop: 4, marginBottom: 4 }} aria-hidden="true" />

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
            onClose();
          }}
          style={{
            alignSelf: 'stretch', paddingTop: 8, paddingBottom: 8, paddingRight: 8,
            borderRadius: 4, display: 'inline-flex', justifyContent: 'flex-start',
            alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8FA'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
        >
          <div style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true" />
          <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, background: '#EEF3F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} strokeWidth={1.75} color="#2A5DB7" aria-hidden="true" />
          </div>
          <div style={{ flex: '1 1 0', display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2 }}>
            <div style={{ alignSelf: 'stretch', color: '#001A35', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Design System Docs</div>
            <div style={{ alignSelf: 'stretch', color: '#6B7D8F', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Guidelines &amp; components</div>
          </div>
        </a>
      </div>
    </div>
  );
}
