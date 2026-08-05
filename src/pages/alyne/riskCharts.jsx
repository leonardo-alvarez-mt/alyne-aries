import { t, RISK_CHART, FONT_HEADING } from './alyneTokens';
import { HEATMAP, RATING_DISTRIBUTION, EXPOSURE_SERIES, TREATMENT_STRATEGY } from './riskData';

const CARD_MIN_H = 140;

function ChartCard({ title, children, bodyClassName = '', padded = true }) {
  return (
    <div
      className={`flex flex-col overflow-hidden bg-white ${padded ? 'p-4' : ''}`}
      style={{
        minHeight: CARD_MIN_H,
        borderRadius: '5.25px',
        border: `1px solid ${t.borderSubtle}`,
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
      }}
    >
      {title && (
        <h3 className="m-0 mb-2 text-sm font-bold leading-none" style={{ color: t.textPrimary, fontFamily: FONT_HEADING }}>
          {title}
        </h3>
      )}
      <div className={`flex flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/* ─────────────────────────── Heatmap (5×5) ─────────────────────────── */

export function RiskHeatmap() {
  return (
    <ChartCard padded={false} bodyClassName="h-full">
      <div
        className="grid h-full flex-1"
        style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridAutoRows: '1fr' }}
        role="group"
        aria-label="Residual risk heatmap"
      >
        {HEATMAP.flatMap((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              type="button"
              aria-label={`Risk heatmap cell: ${cell.value} risks`}
              className="flex items-center justify-center text-[11px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              style={{ background: cell.color }}
            >
              {cell.value}
            </button>
          ))
        )}
      </div>
    </ChartCard>
  );
}

/* ─────────────────────────── Risk Rating (stacked bar) ─────────────────────────── */

export function RiskRatingDistribution() {
  const total = RATING_DISTRIBUTION.reduce((sum, s) => sum + s.value, 0);
  return (
    <ChartCard title="Risk Rating" bodyClassName="justify-center">
      <div
        className="flex h-9 w-full overflow-hidden rounded-md"
        role="img"
        aria-label={`Risk rating distribution: ${RATING_DISTRIBUTION.map((s) => `${s.key} ${s.value}`).join(', ')}`}
      >
        {RATING_DISTRIBUTION.map((seg) => (
          <div
            key={seg.key}
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            title={`${seg.key}: ${seg.value}`}
          />
        ))}
      </div>
    </ChartCard>
  );
}

/* ─────────────────────────── Risk Exposure (sparkline) ─────────────────────────── */

function sparkPoints(series, width, height, pad) {
  const min = 0;
  const max = 100;
  const stepX = (width - pad * 2) / (series.length - 1);
  return series.map((v, i) => {
    const x = pad + i * stepX;
    const y = height - pad - ((v - min) / (max - min)) * (height - pad * 2);
    return { x, y };
  });
}

export function RiskExposureSparkline() {
  const width = 240;
  const height = 76;
  const pad = 8;
  const top = sparkPoints(EXPOSURE_SERIES.top, width, height, pad);
  const bottom = sparkPoints(EXPOSURE_SERIES.bottom, width, height, pad);
  const toPolyline = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <ChartCard title="Risk Exposure" bodyClassName="justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Risk exposure over time — two mostly flat series"
      >
        {[bottom, top].map((pts, idx) => {
          const color = idx === 1 ? RISK_CHART.exposureTop : RISK_CHART.exposureBottom;
          return (
            <g key={idx}>
              <polyline points={toPolyline(pts)} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={1.9} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

/* ─────────────────────────── Treatment Strategy (bars) ─────────────────────────── */

export function TreatmentStrategyChart() {
  const max = Math.max(...TREATMENT_STRATEGY.map((d) => d.value));
  return (
    <ChartCard title="Treatment Strategy" bodyClassName="justify-center gap-1.5">
      {TREATMENT_STRATEGY.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-[11px]" style={{ color: t.textSecondary }}>
          <span className="w-[64px] shrink-0 truncate text-right">{d.label}</span>
          <span className="flex min-w-0 flex-1 items-center">
            <span
              className="h-2.5 rounded-sm"
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%`, background: RISK_CHART.treatmentBar }}
            />
          </span>
          <span className="w-6 shrink-0 tabular-nums" style={{ color: t.textMuted }}>{d.value}</span>
        </div>
      ))}
    </ChartCard>
  );
}

/* ─────────────────────────── Strip wrapper ─────────────────────────── */

export function RiskAnalyticsStrip() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RiskHeatmap />
      <RiskRatingDistribution />
      <RiskExposureSparkline />
      <TreatmentStrategyChart />
    </div>
  );
}
