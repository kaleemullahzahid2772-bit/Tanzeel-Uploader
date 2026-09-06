'use client';

import React, { useState } from 'react';
import { AnalyticsTimeSeriesPoint } from '@/lib/types/database';
import { Eye, ThumbsUp, Users, Send, BarChart2 } from 'lucide-react';

interface AnalyticsChartsProps {
  data: AnalyticsTimeSeriesPoint[];
  loading?: boolean;
}

type ChartMetric = 'views' | 'engagement' | 'reach' | 'followers' | 'postsPublished';

export function AnalyticsCharts({ data, loading = false }: AnalyticsChartsProps) {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('views');

  const metricConfig: Record<ChartMetric, { label: string; urdu: string; icon: any; color: string; fillGradient: string }> = {
    views: { label: 'Video & Content Views', urdu: 'ویڈیوز اور مواد کے ویوز', icon: Eye, color: '#10B981', fillGradient: 'url(#emeraldGradient)' },
    engagement: { label: 'Total Engagements', urdu: 'مجموعی انگیجمنٹ', icon: ThumbsUp, color: '#F59E0B', fillGradient: 'url(#goldGradient)' },
    reach: { label: 'Audience Reach', urdu: 'پہنچ / ریچ', icon: BarChart2, color: '#3B82F6', fillGradient: 'url(#blueGradient)' },
    followers: { label: 'Follower Growth', urdu: 'فالورز میں اضافہ', icon: Users, color: '#8B5CF6', fillGradient: 'url(#purpleGradient)' },
    postsPublished: { label: 'Published Posts', urdu: 'شائع شدہ پوسٹس', icon: Send, color: '#EC4899', fillGradient: 'url(#pinkGradient)' },
  };

  const getVal = (point: AnalyticsTimeSeriesPoint) => {
    return point[activeMetric] || 0;
  };

  const values = data.map(d => getVal(d));
  const maxVal = Math.max(...values, 5);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  // Chart Dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Compute SVG Points
  const points = data.map((d, index) => {
    const x = data.length <= 1 ? chartW / 2 + paddingX : paddingX + (index / (data.length - 1)) * chartW;
    const y = height - paddingY - ((getVal(d) - minVal) / range) * chartH;
    return { x, y, val: getVal(d), date: d.date };
  });

  const pathD = points.length > 1 
    ? 'M ' + points[0].x + ' ' + points[0].y + ' ' + points.slice(1).map(p => 'L ' + p.x + ' ' + p.y).join(' ')
    : points.length === 1 ? 'M ' + paddingX + ' ' + points[0].y + ' L ' + (width - paddingX) + ' ' + points[0].y : '';

  const areaD = points.length > 1
    ? pathD + ' L ' + points[points.length - 1].x + ' ' + (height - paddingY) + ' L ' + points[0].x + ' ' + (height - paddingY) + ' Z'
    : '';

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Performance Trends Over Time
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            منتخب کردہ مدت کے دوران کارکردگی کا تقابلی گراف
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#162520] rounded-xl">
          {(Object.keys(metricConfig) as ChartMetric[]).map((key) => {
            const conf = metricConfig[key];
            const Icon = conf.icon;
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (
                  isActive
                    ? 'bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        {loading ? (
          <div className="w-full h-60 bg-gray-100 dark:bg-emerald-950/30 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-400">
            Loading analytics trend data...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-60 border border-dashed border-gray-200 dark:border-emerald-800/40 rounded-xl flex flex-col items-center justify-center text-xs text-gray-400 gap-1">
            <p>No telemetry recorded for this interval.</p>
            <p className="font-urdu text-[11px]">اس مدت کے لیے کوئی ڈیٹاریکارڈ نہیں ملا۔</p>
          </div>
        ) : (
          <div className="w-full min-w-[500px]">
            <svg
              viewBox={'0 0 ' + width + ' ' + height}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * chartH;
                const val = Math.round(maxVal - ratio * range);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-gray-100 dark:text-emerald-950/60"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-gray-400 dark:fill-gray-600 font-mono"
                    >
                      {val.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              {areaD && (
                <path
                  d={areaD}
                  fill={metricConfig[activeMetric].fillGradient}
                />
              )}

              {/* Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={metricConfig[activeMetric].color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Hover Triggers */}
              {points.map((p, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 3.5}
                      fill={metricConfig[activeMetric].color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Date label at bottom */}
                    {(points.length <= 10 || i % Math.ceil(points.length / 8) === 0 || i === points.length - 1) && (
                      <text
                        x={p.x}
                        y={height - 8}
                        textAnchor="middle"
                        className="text-[10px] fill-gray-400 dark:fill-gray-500 font-mono"
                      >
                        {p.date ? p.date.slice(5) : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div 
                className="absolute top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 dark:bg-emerald-950/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-emerald-500/30 pointer-events-none flex items-center gap-3 z-20"
              >
                <div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {points[hoveredIndex].date}
                  </div>
                  <div className="font-bold text-sm text-emerald-400">
                    {points[hoveredIndex].val.toLocaleString()} {metricConfig[activeMetric].label}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
