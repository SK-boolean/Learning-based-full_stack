import React, { useState, useRef, useEffect } from 'react';
import { playSoftClick } from '../utils/audio';

interface DwellButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dwellEnabled?: boolean;
  dwellDurationMs?: number;
  onDwellClick?: () => void;
  soundEnabled?: boolean;
  children: React.ReactNode;
  isLargeCpTarget?: boolean;
}

export const DwellButton: React.FC<DwellButtonProps> = ({
  dwellEnabled = false,
  dwellDurationMs = 1500,
  onDwellClick,
  soundEnabled = true,
  onClick,
  children,
  className = '',
  disabled = false,
  isLargeCpTarget = false,
  ...restProps
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const clearDwell = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
    setIsHovering(false);
  };

  const handlePointerEnter = () => {
    if (disabled || !dwellEnabled) return;
    setIsHovering(true);
    startTimeRef.current = performance.now();

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, (elapsed / dwellDurationMs) * 100);
      setProgress(pct);

      if (elapsed >= dwellDurationMs) {
        // Dwell complete! Trigger auto-click
        if (soundEnabled) playSoftClick();
        if (onDwellClick) {
          onDwellClick();
        } else if (onClick) {
          onClick({} as React.MouseEvent<HTMLButtonElement>);
        }
        clearDwell();
      } else {
        timerRef.current = requestAnimationFrame(step);
      }
    };

    timerRef.current = requestAnimationFrame(step);
  };

  const handlePointerLeave = () => {
    clearDwell();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // Jitter filter: ignore accidental double-taps within 350ms
    const now = Date.now();
    if (now - lastClickTimeRef.current < 350) {
      e.preventDefault();
      return;
    }
    lastClickTimeRef.current = now;
    
    if (soundEnabled) playSoftClick();
    clearDwell();
    onClick?.(e);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  return (
    <button
      {...restProps}
      disabled={disabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative overflow-hidden select-none transition-all active:scale-98 ${
        isLargeCpTarget 
          ? 'min-h-[72px] p-4 text-lg md:text-xl font-bold rounded-2xl border-4' 
          : 'rounded-xl'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Dwell Progress Bar Indicator (if dwell mode active) */}
      {dwellEnabled && isHovering && progress > 0 && (
        <div 
          className="absolute inset-x-0 bottom-0 h-2 bg-amber-400 opacity-90 transition-all pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Radial Dwell badge if hovering */}
      {dwellEnabled && isHovering && progress > 0 && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 shadow-sm flex items-center justify-center pointer-events-none z-10 border border-amber-300">
          <svg className="w-5 h-5 -rotate-90">
            <circle cx="10" cy="10" r="7" stroke="#E2E8F0" strokeWidth="2.5" fill="none" />
            <circle
              cx="10"
              cy="10"
              r="7"
              stroke="#F59E0B"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={44}
              strokeDashoffset={44 - (44 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      <div className="relative z-0 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
};
