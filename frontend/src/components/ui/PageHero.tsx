import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageSrc?: string; // Kept for backwards compatibility but ignored
  imagePosition?: string; // Ignored
  height?: number; // Ignored
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ 
  title, 
  subtitle, 
  children
}) => {
  return (
    <div className="w-full bg-white border-b border-border pt-32 pb-10 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[36px] font-display font-semibold text-text-black tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-text-mid text-[16px] mt-2 max-w-2xl"
           >
             {subtitle}
           </motion.p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};
