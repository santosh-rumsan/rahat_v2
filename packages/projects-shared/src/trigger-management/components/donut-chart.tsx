import * as React from 'react'

interface DonutChartProps {
  total: number
  mandatory: number
  mandatoryTriggered: number
  optional: number
  optionalTriggered: number
  size?: number
  strokeWidth?: number
}

export function DonutChart({
  total,
  mandatoryTriggered,
  optionalTriggered,
  size = 140,
  strokeWidth = 14,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const triggered = mandatoryTriggered + optionalTriggered
  const triggeredFraction = total > 0 ? triggered / total : 0
  const mandatoryFraction = total > 0 ? mandatoryTriggered / total : 0

  // Segments: triggered mandatory (blue), triggered optional (gold), rest (light blue)
  const triggeredDash = triggeredFraction * circumference
  const mandatoryDash = mandatoryFraction * circumference
  const optionalDash = triggeredDash - mandatoryDash

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#bfdbfe"
          strokeWidth={strokeWidth}
        />
        {/* Optional triggered (gold) */}
        {optionalDash > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${optionalDash} ${circumference - optionalDash}`}
            strokeDashoffset={-mandatoryDash}
            strokeLinecap="butt"
          />
        )}
        {/* Mandatory triggered (blue) */}
        {mandatoryDash > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${mandatoryDash} ${circumference - mandatoryDash}`}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size, marginTop: -(size + 4) }}
      >
        <span className="text-xs text-slate-500">Total</span>
        <span className="text-2xl font-bold text-slate-900">{total}</span>
      </div>
    </div>
  )
}
