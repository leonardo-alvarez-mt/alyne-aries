import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { t } from './alyneTokens';

const SCROLL_ROOT_ID = 'shell-main-content';
const SCROLL_OFFSET = 16;

/**
 * Right-side Table of Contents for the Control Set detail page.
 *
 * @param {{ sections: Array<{ id: string, label: string, level: 'topic' | 'sub' }> }} props
 * `sections` is the flat, in-document-order list of anchors the page renders.
 * Clicking scrolls the shell content area to the matching section; the active
 * section is tracked while scrolling via IntersectionObserver.
 */
export default function ControlSetToc({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
  const visibleRef = useRef(new Map());

  useEffect(() => {
    const root = document.getElementById(SCROLL_ROOT_ID);
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!els.length) return undefined;

    visibleRef.current = new Map();
    const order = sections.map((s) => s.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleRef.current.set(entry.target.id, true);
          else visibleRef.current.delete(entry.target.id);
        }
        // Highlight the first visible section in document order.
        const firstVisible = order.find((id) => visibleRef.current.has(id));
        if (firstVisible) setActiveId(firstVisible);
      },
      { root: root ?? null, rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(e, id) {
    e.preventDefault();
    const el = document.getElementById(id);
    const root = document.getElementById(SCROLL_ROOT_ID);
    if (!el) return;
    setActiveId(id);
    if (root) {
      const top = root.scrollTop + (el.getBoundingClientRect().top - root.getBoundingClientRect().top) - SCROLL_OFFSET;
      root.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (!sections.length) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-0 flex flex-col gap-1 py-1">
      <p className="m-0 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.textMuted }}>
        Table of contents
      </p>
      {sections.map((s) => {
        const active = s.id === activeId;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => scrollTo(e, s.id)}
            aria-current={active ? 'location' : undefined}
            className={cn(
              'block truncate rounded-md py-1.5 text-[13px] transition-colors',
              s.level === 'topic' ? 'px-3 font-semibold' : 'pl-6 pr-3 font-normal',
              !active && 'hover:bg-[#F2F4F7]'
            )}
            style={{
              color: active ? '#000000' : s.level === 'topic' ? t.textPrimary : t.textMuted,
              background: active ? '#e3e9ef' : undefined,
            }}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
