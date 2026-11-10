import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

interface StatusBadgeProps {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'PENDING' | 'ACTIVE' | 'INACTIVE';
  text?: string;
  className?: string;
  dotOnly?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className, dotOnly }) => {
  const styles = {
    NORMAL: "bg-primary-tint text-primary",
    WARNING: "bg-warning-light text-warning",
    CRITICAL: "bg-danger-light text-danger",
    PENDING: "bg-accent-light text-accent",
    ACTIVE: "bg-primary-tint text-primary",
    INACTIVE: "bg-background text-text-mid"
  };

  const dotStyles = {
    NORMAL: "bg-primary",
    WARNING: "bg-warning",
    CRITICAL: "bg-danger",
    PENDING: "bg-accent",
    ACTIVE: "bg-primary",
    INACTIVE: "bg-text-muted"
  };

  const label = text || status.charAt(0) + status.slice(1).toLowerCase();

  if (dotOnly) {
    return (
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        className={cn("w-2.5 h-2.5 rounded-full", dotStyles[status], className)} 
      />
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-badge text-[12px] font-medium tracking-wide font-body uppercase",
        styles[status],
        className
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", dotStyles[status])} />
      {label}
    </motion.div>
  );
};
