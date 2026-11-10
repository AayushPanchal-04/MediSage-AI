import React from 'react';
import { motion } from 'framer-motion';

export const FloatingBadge: React.FC<{
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  timestamp?: string;
  className?: string;
  delay?: number;
}> = ({ icon, title, subtitle, timestamp, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: [-8, 8, -8], opacity: 1 }}
      transition={{ 
        opacity: { duration: 0.8, delay },
        y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay }
      }}
      className={`absolute bg-white/90 backdrop-blur-md rounded-btn p-4 shadow-float flex items-start gap-4 ${className}`}
    >
      {icon && <div className="mt-1">{icon}</div>}
      <div className="flex flex-col">
        <span className="font-body font-semibold text-text-black">{title}</span>
        {subtitle && <span className="font-mono text-[13px] text-text-mid mt-1">{subtitle}</span>}
        {timestamp && <span className="font-body text-[12px] text-text-muted mt-2">{timestamp}</span>}
      </div>
    </motion.div>
  );
};
