import { useState } from 'react';
import {
  RefreshCw, Pencil, Plus, GraduationCap, AlertCircle,
  ChevronDown, MoreHorizontal, CheckCircle2,
} from 'lucide-react';
import { ACCENT, pageShellClass, DASHBOARD_OPTIONS, DEMO_USER } from './alyneTokens';

function OutlineButton({ icon, label }) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#0B1F3A] transition-colors hover:bg-[#F8FAFC]"
    >
      <span className="flex items-center text-[#667085]">{icon}</span>
      {label}
    </button>
  );
}

function OpenTasksWidget() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start justify-between border-b border-gray-100 px-[18px] pb-3 pt-3.5">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="shrink-0 text-gray-400" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold text-[#1A2141]">Open Tasks</span>
          </div>
          <p className="m-0 pl-[22px] text-xs text-gray-400">My open tasks sorted by due date</p>
        </div>
        <button
          type="button"
          aria-label="Widget options"
          className="flex cursor-pointer items-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <MoreHorizontal size={16} aria-hidden />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 px-6 py-[72px]">
        <CheckCircle2 size={40} className="text-slate-300" strokeWidth={1.25} aria-hidden />
        <p className="m-0 text-sm text-slate-400">No Tasks available</p>
      </div>
    </div>
  );
}

export default function AlyneHome() {
  const [dashboard, setDashboard] = useState(DASHBOARD_OPTIONS[0]);
  const { firstName, orgName } = DEMO_USER;

  return (
    <div className={pageShellClass}>
      <h1 className="mb-3 text-[26px] font-bold leading-tight">
        <span className="text-[#1A2141]">Welcome {firstName} P </span>
        <span style={{ color: ACCENT }}>{orgName}</span>
      </h1>

      <div className="mb-6 flex gap-2.5">
        <OutlineButton icon={<GraduationCap size={14} aria-hidden />} label="Compliance Trainings" />
        <OutlineButton icon={<AlertCircle size={14} aria-hidden />} label="Submit a Report to the Hotline" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative inline-flex items-center">
          <select
            value={dashboard}
            onChange={(e) => setDashboard(e.target.value)}
            aria-label="Select dashboard"
            className="cursor-pointer appearance-none rounded-md border border-[#D0D5DD] bg-white py-1.5 pl-3 pr-8 text-[13px] font-medium text-[#0B1F3A] outline-none"
          >
            {DASHBOARD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden />
        </div>

        <div className="flex items-center gap-5">
          <OutlineButton icon={<RefreshCw size={13} aria-hidden />} label="Refresh Dashboard" />
          <OutlineButton icon={<Pencil size={13} aria-hidden />} label="Edit Dashboard" />
          <OutlineButton icon={<Plus size={13} aria-hidden />} label="Create Dashboard" />
        </div>
      </div>

      <OpenTasksWidget />
    </div>
  );
}
