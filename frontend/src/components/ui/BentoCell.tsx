import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface BentoCellProps extends HTMLMotionProps<"div"> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}

export const BentoCell: React.FC<BentoCellProps> = ({ 
  children, 
  colSpan = 1, 
  rowSpan = 1, 
  className,
  ...props 
}) => {
  const colClasses = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
  };

  const rowClasses = {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface rounded-card shadow-card border border-border p-6 overflow-hidden relative",
        colClasses[colSpan],
        rowClasses[rowSpan],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
