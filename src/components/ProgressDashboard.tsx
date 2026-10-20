import React, { useState } from 'react';
import { Download, RotateCcw, Bookmark, MessageSquarePlus, Search } from 'lucide-react';
import { DailyEngagementPoint, ScanLogEntry } from '../data/botanicalData';

interface ProgressDashboardProps {
  dailyProgress: DailyEngagementPoint[];
  scanLogs: ScanLogEntry[];
  onExportCsv: () => void;
  onResetSessionLogs: () => void;
  onUpdateNote?: (scanId: string, note: string) => void;
  onToggleBookmark?: (scanId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  dailyProgress,
  scanLogs,
  onExportCsv,
  onResetSessionLogs,
  onUpdateNote,
  onToggleBookmark,
}) => {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number>(
    dailyProgress.length - 1
  );
  const [hoveredVitalityIdx, setHoveredVitalityIdx] = useState<number>(
    dailyProgress.length - 1
  );
  const [logFilter, setLogFilter] = useState<'all' | 'medicinal' | 'weed' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  const activeDay =
    dailyProgress[hoveredDayIdx] || dailyProgress[dailyProgress.length - 1];
  const activeVitality =
    dailyProgress[hoveredVitalityIdx] || dailyProgress[dailyProgress.length - 1];

  const totalWeeklyScans = dailyProgress.reduce((acc, d) => acc + d.totalScans, 0);
  const totalVerified = dailyProgress.reduce(
    (acc, d) => acc + d.verifiedTriggers,
    0
  );
  const meanHealthIndex =
    dailyProgress.reduce((acc, d) => acc + d.leafHealthIndex, 0) /
    Math.max(1, dailyProgress.length);
  const meanSpad =
    dailyProgress.reduce((acc, d) => acc + d.chlorophyllSpad, 0) /
    Math.max(1, dailyProgress.length);

  const filteredLogs = scanLogs.filter((entry) => {
    if (logFilter === 'medicinal' && entry.category !== 'medicinal') return false;
    if (logFilter === 'weed' && entry.category !== 'weed') return false;
    if (logFilter === 'bookmarked' && !entry.bookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entry.specimenName.toLowerCase().includes(q);
      const matchScientific = entry.scientificName.toLowerCase().includes(q);
      const matchNote = entry.notes?.toLowerCase().includes(q);
      if (!matchName && !matchScientific && !matchNote) return false;
    }
    return true;
  });

  const chartW = 540;
  const chartH = 205;
  const padL = 36;
  const padR = 18;
  const padT = 18;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxScans = Math.max(80, ...dailyProgress.map((d) => d.totalScans + 10));

  const vitalityPoints = dailyProgress.map((d, idx) => {
    const x = padL + (idx / Math.max(1, dailyProgress.length - 1)) * plotW;
    const y = padT + plotH - ((d.leafHealthIndex - 70) / 30) * plotH;
    const ySpad = padT + plotH - ((d.chlorophyllSpad - 35) / 17) * plotH;
    return { x, y, ySpad, data: d };
  });

  const healthPolyline = vitalityPoints
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const spadPolyline = vitalityPoints
    .map((p) => `${p.x.toFixed(1)},${p.ySpad.toFixed(1)}`)
    .join(' ');

  const handleSaveNote = (id: string) => {
    if (onUpdateNote) {
      onUpdateNote(id, tempNoteText);
    }
    setEditingNoteId(null);
  };

  return (
    <section
      id="analytics"
      className="py-10 md:py-14 border-t border-slate-200/80 scroll-mt-20"
      aria-labelledby="analytics-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="text-xs text-slate-400">
            <span>04. Progress & Plant Health Insights</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Daily Engagement & Foliar Vitality</span>
          </div>
          <h2
            id="analytics-heading"
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1"
          >
            User Progress & Field History Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResetSessionLogs}
            className="min-h-[42px] px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="min-h-[42px] px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4-Column Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="text-xs text-slate-400">Weekly Scans</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl md:text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {totalWeeklyScans}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">frames</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="text-xs text-slate-400">Verified (≥85%)</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-700 tabular-nums">
              {totalVerified}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">confirmed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="text-xs text-slate-400">Mean Health Index</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl md:text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {meanHealthIndex.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">% vitality</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="text-xs text-slate-400">Chlorophyll Density</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl md:text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {meanSpad.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">SPAD</span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Daily Engagement Levels */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Daily Engagement & Verified Detections
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total camera scans vs. ≥85% verified triggers
                </p>
              </div>
              <div className="text-right font-mono text-xs tabular-nums text-slate-600">
                <span className="text-slate-400">{activeDay.dateLabel} · </span>
                <span className="font-semibold text-emerald-700">
                  {activeDay.verifiedTriggers} verified
                </span>
                <span> / {activeDay.totalScans}</span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full min-w-[320px] h-auto select-none cursor-crosshair"
                role="img"
                aria-label="Daily engagement chart"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const y = padT + plotH * (1 - frac);
                  const val = Math.round(maxScans * frac);
                  return (
                    <g key={frac}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="font-mono text-[9px] fill-slate-400 tabular-nums"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {dailyProgress.map((d, idx) => {
                  const slotW = plotW / dailyProgress.length;
                  const centerX = padL + slotW * idx + slotW / 2;
                  const barW = 14;
                  const totalH = (d.totalScans / maxScans) * plotH;
                  const verifiedH = (d.verifiedTriggers / maxScans) * plotH;
                  const isHovered = idx === hoveredDayIdx;

                  return (
                    <g
                      key={d.day}
                      onMouseEnter={() => setHoveredDayIdx(idx)}
                      onClick={() => setHoveredDayIdx(idx)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={centerX - barW - 2}
                        y={padT + plotH - totalH}
                        width={barW}
                        height={totalH}
                        rx={4}
                        fill={isHovered ? '#94A3B8' : '#E2E8F0'}
                      />
                      <rect
                        x={centerX + 2}
                        y={padT + plotH - verifiedH}
                        width={barW}
                        height={verifiedH}
                        rx={4}
                        fill={isHovered ? '#047857' : '#10B981'}
                      />
                      <text
                        x={centerX}
                        y={chartH - 8}
                        textAnchor="middle"
                        className={`font-mono text-[10px] ${
                          isHovered
                            ? 'fill-slate-900 font-semibold'
                            : 'fill-slate-400'
                        }`}
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-xs bg-slate-200" />
                <span>Total Scans</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Verified (≥85%)</span>
              </span>
            </div>
            <span className="font-mono tabular-nums">
              Noise Blocked: {activeDay.noiseRejected}
            </span>
          </div>
        </div>

        {/* Chart 2: Plant Health & Chlorophyll Vitality Insights */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Plant Health & Chlorophyll Vitality Curve
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Leaf health index (%) and chlorophyll density (SPAD)
                </p>
              </div>
              <div className="text-right font-mono text-xs tabular-nums text-slate-600">
                <span className="text-slate-400">{activeVitality.day} · </span>
                <span className="font-semibold text-emerald-700">
                  {activeVitality.leafHealthIndex.toFixed(1)}% health
                </span>
                <span> · {activeVitality.chlorophyllSpad.toFixed(1)} SPAD</span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full min-w-[320px] h-auto select-none cursor-crosshair"
                role="img"
                aria-label="Plant health insights line chart"
              >
                {[70, 77.5, 85, 92.5, 100].map((val) => {
                  const y = padT + plotH - ((val - 70) / 30) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="font-mono text-[9px] fill-slate-400 tabular-nums"
                      >
                        {val.toFixed(0)}%
                      </text>
                    </g>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  points={spadPolyline}
                />

                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  points={healthPolyline}
                />

                {vitalityPoints.map((pt, idx) => {
                  const isHovered = idx === hoveredVitalityIdx;
                  return (
                    <g
                      key={pt.data.day}
                      onMouseEnter={() => setHoveredVitalityIdx(idx)}
                      onClick={() => setHoveredVitalityIdx(idx)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={pt.x - 18}
                        y={padT}
                        width={36}
                        height={plotH}
                        fill="transparent"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.ySpad}
                        r={isHovered ? 4 : 2.5}
                        fill="#64748B"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 4.5 : 3}
                        fill="#059669"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x}
                        y={chartH - 8}
                        textAnchor="middle"
                        className={`font-mono text-[10px] ${
                          isHovered
                            ? 'fill-slate-900 font-semibold'
                            : 'fill-slate-400'
                        }`}
                      >
                        {pt.data.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-0.5 bg-emerald-600" />
                <span>Leaf Health (%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-0.5 border-b border-dashed border-slate-400" />
                <span>Chlorophyll (SPAD)</span>
              </span>
            </div>
            <span className="font-mono tabular-nums">
              Confidence Mean: {activeVitality.avgConfidence.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recognition History Table with Field Notes & Mobile Responsive Cards */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Verified Field Detection Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Botanical observations recorded at ≥85% confidence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search log or notes..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-400 transition-colors w-40 sm:w-48"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
              {(['all', 'medicinal', 'weed', 'bookmarked'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLogFilter(tab)}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    logFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all'
                    ? 'All'
                    : tab === 'medicinal'
                    ? 'Medicinal'
                    : tab === 'weed'
                    ? 'Weeds'
                    : 'Saved'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-mono">
                <th className="py-3 px-6 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">TIME</th>
                <th className="py-3 px-4 font-medium">SPECIMEN</th>
                <th className="py-3 px-4 font-medium">CONFIDENCE</th>
                <th className="py-3 px-4 font-medium">FIELD OBSERVATION / NOTE</th>
                <th className="py-3 px-6 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No verified scans match your filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-6 font-mono text-slate-700 tabular-nums">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">
                        {log.specimenName}
                      </span>
                      <span className="mx-1.5 text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="italic text-slate-400">
                        {log.scientificName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700 tabular-nums">
                      {log.confidence.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {editingNoteId === log.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Add field note..."
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(log.id);
                              if (e.key === 'Escape') setEditingNoteId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(log.id)}
                            className="px-2 py-1 text-[11px] bg-slate-900 text-white rounded-md cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNoteId(log.id);
                            setTempNoteText(log.notes || '');
                          }}
                          className="cursor-pointer group flex items-center gap-1 text-slate-600 hover:text-slate-900"
                          title="Click to edit field note"
                        >
                          <span className="truncate">
                            {log.notes || (
                              <span className="text-slate-300 italic group-hover:text-slate-400">
                                + Add note...
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {onToggleBookmark && (
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(log.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={log.bookmarked ? 'Remove bookmark' : 'Bookmark observation'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              log.bookmarked ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (optimized for thumb touch screens) */}
        <div className="sm:hidden divide-y divide-slate-100 p-3">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No verified scans match your search.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-400 text-[11px]">{log.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">
                      {log.confidence.toFixed(1)}%
                    </span>
                    {onToggleBookmark && (
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(log.id)}
                        className="p-1 text-slate-400"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            log.bookmarked ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{log.specimenName}</h4>
                  <p className="text-xs italic text-slate-500">{log.scientificName}</p>
                </div>

                {editingNoteId === log.id ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={tempNoteText}
                      onChange={(e) => setTempNoteText(e.target.value)}
                      placeholder="Add observation note..."
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(log.id)}
                      className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingNoteId(log.id);
                      setTempNoteText(log.notes || '');
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {log.notes || 'Tap to add field note...'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
