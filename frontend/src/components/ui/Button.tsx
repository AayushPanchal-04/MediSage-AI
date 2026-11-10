import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center font-body font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-btn";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-mid focus:ring-primary",
      secondary: "bg-primary/10 text-primary hover:bg-primary/20 focus:ring-primary",
      ghost: "bg-transparent text-text-mid hover:bg-black/5 dark:hover:bg-white/5 focus:ring-border",
      danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger"
    };

    const sizes = {
      sm: "h-9 px-4 text-[13px]",
      md: "h-11 px-6 text-[15px]",
      lg: "h-14 px-8 text-[16px]"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.12 }}
        className={cn(
          baseClass,
          variants[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
