import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../ui/Button';

/** Maps any level/direction/severity string to a consistent colour tone. */
export const toneOf = (value?: string) => {
  switch (String(value || '').toUpperCase()) {
    case 'EMERGENCY':
    case 'CRITICAL':
    case 'HIGH':
    case 'WORSE':
    case 'WORSENING':
      return 'bg-danger/10 text-danger border-danger/20';
    case 'URGENT':
    case 'MODERATE':
    case 'MEDIUM':
    case 'FLUCTUATING':
    case 'WARNING':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'BETTER':
    case 'IMPROVING':
    case 'LOW':
    case 'ROUTINE':
    case 'SELF_CARE':
    case 'STABLE':
    case 'NORMAL':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-background text-text-mid border-border';
  }
};

export const LevelPill: React.FC<{ value?: string; className?: string }> = ({ value, className }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-badge text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap',
      toneOf(value),
      className,
    )}
  >
    {String(value || 'unknown').replace(/_/g, ' ')}
  </span>
);

/** Section heading used inside every AI card. */
export const AiSectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  icon,
  children,
  className,
}) => (
  <h3 className={cn('flex items-center gap-2 text-[14px] font-bold uppercase tracking-wide text-text-muted mb-4', className)}>
    {icon}
    {children}
  </h3>
);

/** Renders loading / error / empty states and calls back when the result is ready. */
export const AiState: React.FC<{
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingLabel?: string;
  children: React.ReactNode;
}> = ({ loading, error, onRetry, loadingLabel = 'Asking the AI…', children }) => {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-card p-10 flex flex-col items-center justify-center gap-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
          className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
        <p className="text-[14px] text-text-mid">{loadingLabel}</p>
        <p className="text-[12px] text-text-muted">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/5 border border-danger/20 rounded-card p-8 flex flex-col items-center text-center gap-3">
        <AlertTriangle className="w-6 h-6 text-danger" />
        <p className="text-[14px] text-text-black max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-2 text-[13px] font-medium text-danger hover:underline"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

/** Small "regenerate" control shown on every AI surface. */
export const RefreshButton: React.FC<{ onClick: () => void; loading?: boolean }> = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center gap-2 text-[12px] font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-50"
  >
    <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Regenerate
  </button>
);

/** The AI answer card shell with a branded header. */
export const AiShell: React.FC<{
  title: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, onRefresh, refreshing, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={cn('w-full bg-white border border-border rounded-card shadow-sm overflow-hidden', className)}
  >
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-primary/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-[15px] text-text-black tracking-tight">{title}</span>
      </div>
      {onRefresh && <RefreshButton onClick={onRefresh} loading={refreshing} />}
    </div>
    <div className="p-6 md:p-8">{children}</div>
  </motion.div>
);

export const isAiUnavailable = (payload: any) => Boolean(payload && payload.error);
